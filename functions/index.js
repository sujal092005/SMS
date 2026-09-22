const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Helper to generate a random 8-character temporary password
function generateTempPassword(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Helper to sanitize Login ID to email
function loginIdToEmail(loginId) {
  const clean = loginId.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${clean}@ravs.school`;
}

// Helper to check and increment user count against school maxUsers
async function checkAndIncrementUserCount(transaction, countToAdd = 1) {
  const configRef = db.doc('school/config');
  const configDoc = await transaction.get(configRef);

  let maxUsers = 500;
  let currentUserCount = 0;

  if (configDoc.exists) {
    const data = configDoc.data();
    maxUsers = data.maxUsers || 500;
    currentUserCount = data.currentUserCount || 0;
  } else {
    // initialize config if missing
    transaction.set(configRef, {
      name: 'RAVS Smart School',
      maxUsers: 500,
      currentUserCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  if (currentUserCount + countToAdd > maxUsers) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `School user limit reached (${currentUserCount}/${maxUsers}). Contact institution administrator.`
    );
  }

  transaction.update(configRef, {
    currentUserCount: admin.firestore.FieldValue.increment(countToAdd),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { maxUsers, newCount: currentUserCount + countToAdd };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CREATE TEACHER (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
exports.createTeacher = functions.https.onCall(async (data, context) => {
  // Authorization Check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  // Allow admin or initial setup if no role claim yet
  const callerRole = context.auth.token.role;
  const callerUid = context.auth.uid;

  if (callerRole !== 'admin') {
    // Check if the caller is an admin in users doc as fallback
    const callerDoc = await db.doc(`users/${callerUid}`).get();
    if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only administrators can create teachers.');
    }
  }

  const { name, phone, type, classId, sections, department } = data;
  if (!name || !type) {
    throw new functions.https.HttpsError('invalid-argument', 'Teacher name and type (classTeacher | subjectTeacher) are required.');
  }

  if (type === 'classTeacher' && !classId) {
    throw new functions.https.HttpsError('invalid-argument', 'Assigned class/section is required for Class Teacher.');
  }

  // Generate unique login ID: TCH-<sanitized-name-and-random>
  const nameSlug = name.trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const loginId = `TCH-${nameSlug}${randomSuffix}`;
  const email = loginIdToEmail(loginId);
  const tempPassword = generateTempPassword(8);

  // Check capacity
  await db.runTransaction(async (transaction) => {
    return checkAndIncrementUserCount(transaction, 1);
  });

  try {
    // Create Firebase Auth User
    const userRecord = await auth.createUser({
      email,
      password: tempPassword,
      displayName: name,
      phoneNumber: phone && phone.startsWith('+') ? phone : undefined,
      disabled: false
    });

    // Set Custom Claims
    const customClaims = {
      role: type, // 'classTeacher' | 'subjectTeacher'
      classId: type === 'classTeacher' ? classId : null,
      sections: Array.isArray(sections) ? sections : (classId ? [classId] : [])
    };
    await auth.setCustomUserClaims(userRecord.uid, customClaims);

    // Write to Firestore users/{uid}
    const userDocData = {
      uid: userRecord.uid,
      loginId,
      email,
      name,
      phone: phone || '',
      role: type,
      classId: customClaims.classId,
      sections: customClaims.sections,
      department: department || (type === 'classTeacher' ? `Class Teacher (${classId})` : 'Subject Teacher'),
      active: true,
      mustChangePassword: true,
      createdBy: callerUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.doc(`users/${userRecord.uid}`).set(userDocData);

    // If assigned as class teacher, link class in classes/{classId}
    if (type === 'classTeacher' && classId) {
      await db.doc(`classes/${classId}`).set({
        classId,
        classTeacherUid: userRecord.uid,
        classTeacherName: name,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    return {
      success: true,
      teacher: {
        uid: userRecord.uid,
        loginId,
        email,
        name,
        role: type,
        classId: customClaims.classId,
        sections: customClaims.sections,
        tempPassword
      }
    };
  } catch (error) {
    console.error('Error creating teacher:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to create teacher.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CREATE STUDENT & AUTO PARENT (Class Teacher or Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.createStudent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const callerRole = context.auth.token.role;
  const callerClassId = context.auth.token.classId;
  const callerUid = context.auth.uid;

  const { name, rollNo, dob, parentName, parentPhone, classId } = data;

  if (!name || !rollNo || !dob || !classId) {
    throw new functions.https.HttpsError('invalid-argument', 'Name, Roll No, DOB (DDMMYYYY), and Class ID are required.');
  }

  // Teacher can only create student in their assigned class
  if (callerRole !== 'admin') {
    if (callerRole !== 'classTeacher' || callerClassId !== classId) {
      throw new functions.https.HttpsError('permission-denied', 'Class teachers can only create students for their assigned class.');
    }
  }

  // Standardize roll number (e.g. 14 -> 014, 5 -> 005)
  const cleanRoll = String(rollNo).trim().padStart(3, '0');
  const cleanClass = classId.trim().toUpperCase(); // e.g. 8A
  const studentLoginId = `RAVS-${cleanClass}-${cleanRoll}`;
  const studentEmail = loginIdToEmail(studentLoginId);

  // Initial password = DOB in DDMMYYYY format (e.g. 15082012)
  const cleanDob = dob.replace(/[^0-9]/g, '');
  if (cleanDob.length !== 8) {
    throw new functions.https.HttpsError('invalid-argument', 'DOB must be exactly 8 digits in DDMMYYYY format (e.g. 15082012).');
  }
  const studentInitialPassword = cleanDob;

  // Check if roll number already exists in this class
  const existingStudentQuery = await db.collection('students')
    .where('classId', '==', cleanClass)
    .where('rollNo', '==', cleanRoll)
    .get();

  if (!existingStudentQuery.empty) {
    throw new functions.https.HttpsError('already-exists', `Roll No ${cleanRoll} already exists in Class ${cleanClass}.`);
  }

  // Check capacity (2 accounts: student + potentially parent)
  await db.runTransaction(async (transaction) => {
    return checkAndIncrementUserCount(transaction, 2);
  });

  try {
    // 1. Create / Retrieve Parent Account
    let parentUid = null;
    let parentLoginId = null;
    let parentTempPassword = null;
    let isNewParent = false;

    const cleanParentPhone = (parentPhone || '').replace(/[^0-9]/g, '');
    if (cleanParentPhone.length >= 10) {
      parentLoginId = `PAR-${cleanParentPhone.slice(-10)}`;
      const parentEmail = loginIdToEmail(parentLoginId);

      // Check if parent account already exists
      const existingParentQuery = await db.collection('users')
        .where('role', '==', 'parent')
        .where('phone', '==', cleanParentPhone)
        .get();

      if (!existingParentQuery.empty) {
        parentUid = existingParentQuery.docs[0].id;
      } else {
        // Create new Parent Auth User
        parentTempPassword = generateTempPassword(8);
        const parentUserRecord = await auth.createUser({
          email: parentEmail,
          password: parentTempPassword,
          displayName: parentName || `Parent of ${name}`,
          disabled: false
        });
        parentUid = parentUserRecord.uid;
        isNewParent = true;

        await auth.setCustomUserClaims(parentUid, {
          role: 'parent'
        });

        await db.doc(`users/${parentUid}`).set({
          uid: parentUid,
          loginId: parentLoginId,
          email: parentEmail,
          name: parentName || `Parent of ${name}`,
          phone: cleanParentPhone,
          role: 'parent',
          active: true,
          mustChangePassword: true,
          createdBy: callerUid,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // 2. Create Student Auth User
    const studentUserRecord = await auth.createUser({
      email: studentEmail,
      password: studentInitialPassword,
      displayName: name,
      disabled: false
    });

    // Set Student Custom Claims
    await auth.setCustomUserClaims(studentUserRecord.uid, {
      role: 'student',
      classId: cleanClass
    });

    const studentId = studentUserRecord.uid;

    // 3. Write users/{uid}
    await db.doc(`users/${studentId}`).set({
      uid: studentId,
      loginId: studentLoginId,
      email: studentEmail,
      name,
      role: 'student',
      classId: cleanClass,
      rollNo: cleanRoll,
      active: true,
      mustChangePassword: true,
      createdBy: callerUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 4. Write students/{id} (Public to class & parents)
    await db.doc(`students/${studentId}`).set({
      id: studentId,
      uid: studentId,
      name,
      rollNo: cleanRoll,
      classId: cleanClass,
      loginId: studentLoginId,
      parentName: parentName || '',
      parentPhone: cleanParentPhone || '',
      parentUids: parentUid ? [parentUid] : [],
      active: true,
      mustChangePassword: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5. Write studentPrivate/{id} (Strictly restricted to Admin & Class Teacher)
    await db.doc(`studentPrivate/${studentId}`).set({
      studentId,
      uid: studentId,
      classId: cleanClass,
      dob: cleanDob,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 6. Update class student count
    await db.doc(`classes/${cleanClass}`).set({
      classId: cleanClass,
      studentCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      student: {
        id: studentId,
        name,
        rollNo: cleanRoll,
        classId: cleanClass,
        loginId: studentLoginId,
        initialPassword: studentInitialPassword
      },
      parent: parentUid ? {
        uid: parentUid,
        loginId: parentLoginId,
        name: parentName,
        phone: cleanParentPhone,
        isNew: isNewParent,
        tempPassword: parentTempPassword
      } : null
    };
  } catch (error) {
    console.error('Error creating student:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to create student.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. BULK CREATE STUDENTS VIA CSV (Class Teacher or Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.createStudentsBulk = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const callerRole = context.auth.token.role;
  const callerClassId = context.auth.token.classId;
  const callerUid = context.auth.uid;

  const { classId, students } = data;

  if (!classId || !Array.isArray(students) || students.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Class ID and a non-empty array of students are required.');
  }

  if (callerRole !== 'admin') {
    if (callerRole !== 'classTeacher' || callerClassId !== classId) {
      throw new functions.https.HttpsError('permission-denied', 'Class teachers can only bulk import for their assigned class.');
    }
  }

  const cleanClass = classId.trim().toUpperCase();
  const results = [];
  const errors = [];

  // Enforce Max Users check before bulk loop
  await db.runTransaction(async (transaction) => {
    return checkAndIncrementUserCount(transaction, students.length * 2);
  });

  for (let i = 0; i < students.length; i++) {
    const row = students[i];
    const { name, rollNo, dob, parentName, parentPhone } = row;

    if (!name || !rollNo || !dob) {
      errors.push({ row: i + 1, name: name || 'Unknown', error: 'Missing Name, Roll No, or DOB.' });
      continue;
    }

    const cleanRoll = String(rollNo).trim().padStart(3, '0');
    const cleanDob = String(dob).replace(/[^0-9]/g, '');

    if (cleanDob.length !== 8) {
      errors.push({ row: i + 1, name, rollNo: cleanRoll, error: 'DOB must be 8 digits DDMMYYYY.' });
      continue;
    }

    const studentLoginId = `RAVS-${cleanClass}-${cleanRoll}`;
    const studentEmail = loginIdToEmail(studentLoginId);

    try {
      // Check duplicate
      const duplicateCheck = await db.collection('students')
        .where('classId', '==', cleanClass)
        .where('rollNo', '==', cleanRoll)
        .get();

      if (!duplicateCheck.empty) {
        errors.push({ row: i + 1, name, rollNo: cleanRoll, error: `Roll No ${cleanRoll} already exists in ${cleanClass}.` });
        continue;
      }

      // Handle Parent
      let parentUid = null;
      let parentLoginId = null;
      let parentTempPassword = null;
      let isNewParent = false;
      const cleanParentPhone = (parentPhone || '').replace(/[^0-9]/g, '');

      if (cleanParentPhone.length >= 10) {
        parentLoginId = `PAR-${cleanParentPhone.slice(-10)}`;
        const parentEmail = loginIdToEmail(parentLoginId);

        const existingParentQuery = await db.collection('users')
          .where('role', '==', 'parent')
          .where('phone', '==', cleanParentPhone)
          .get();

        if (!existingParentQuery.empty) {
          parentUid = existingParentQuery.docs[0].id;
        } else {
          parentTempPassword = generateTempPassword(8);
          const parentRecord = await auth.createUser({
            email: parentEmail,
            password: parentTempPassword,
            displayName: parentName || `Parent of ${name}`,
            disabled: false
          });
          parentUid = parentRecord.uid;
          isNewParent = true;

          await auth.setCustomUserClaims(parentUid, { role: 'parent' });
          await db.doc(`users/${parentUid}`).set({
            uid: parentUid,
            loginId: parentLoginId,
            email: parentEmail,
            name: parentName || `Parent of ${name}`,
            phone: cleanParentPhone,
            role: 'parent',
            active: true,
            mustChangePassword: true,
            createdBy: callerUid,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      // Create Student
      const studentRecord = await auth.createUser({
        email: studentEmail,
        password: cleanDob,
        displayName: name,
        disabled: false
      });

      await auth.setCustomUserClaims(studentRecord.uid, {
        role: 'student',
        classId: cleanClass
      });

      const studentId = studentRecord.uid;

      await db.doc(`users/${studentId}`).set({
        uid: studentId,
        loginId: studentLoginId,
        email: studentEmail,
        name,
        role: 'student',
        classId: cleanClass,
        rollNo: cleanRoll,
        active: true,
        mustChangePassword: true,
        createdBy: callerUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.doc(`students/${studentId}`).set({
        id: studentId,
        uid: studentId,
        name,
        rollNo: cleanRoll,
        classId: cleanClass,
        loginId: studentLoginId,
        parentName: parentName || '',
        parentPhone: cleanParentPhone || '',
        parentUids: parentUid ? [parentUid] : [],
        active: true,
        mustChangePassword: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.doc(`studentPrivate/${studentId}`).set({
        studentId,
        uid: studentId,
        classId: cleanClass,
        dob: cleanDob,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      results.push({
        name,
        rollNo: cleanRoll,
        classId: cleanClass,
        loginId: studentLoginId,
        initialPassword: cleanDob,
        parentLoginId,
        parentTempPassword
      });
    } catch (err) {
      errors.push({ row: i + 1, name, error: err.message });
    }
  }

  // Update total class count
  if (results.length > 0) {
    await db.doc(`classes/${cleanClass}`).set({
      classId: cleanClass,
      studentCount: admin.firestore.FieldValue.increment(results.length),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  return {
    success: true,
    totalProcessed: students.length,
    successfulCount: results.length,
    failedCount: errors.length,
    results,
    errors
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. RESET USER PASSWORD (Teacher resets Student/Parent; Admin resets Teacher)
// ─────────────────────────────────────────────────────────────────────────────
exports.resetUserPassword = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const callerRole = context.auth.token.role;
  const callerClassId = context.auth.token.classId;
  const { targetUid } = data;

  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'Target user UID is required.');
  }

  const targetDoc = await db.doc(`users/${targetUid}`).get();
  if (!targetDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Target user not found.');
  }

  const targetData = targetDoc.data();
  let newPassword = '';

  if (targetData.role === 'student') {
    // Teacher or Admin can reset student
    if (callerRole !== 'admin' && (callerRole !== 'classTeacher' || callerClassId !== targetData.classId)) {
      throw new functions.https.HttpsError('permission-denied', 'Only admin or that class teacher can reset student password.');
    }

    // Read student's DOB from studentPrivate
    const privateDoc = await db.doc(`studentPrivate/${targetUid}`).get();
    if (privateDoc.exists && privateDoc.data().dob) {
      newPassword = privateDoc.data().dob;
    } else {
      newPassword = 'Password@123';
    }
  } else if (targetData.role === 'parent') {
    // Class Teacher or Admin can reset parent
    if (callerRole !== 'admin' && callerRole !== 'classTeacher') {
      throw new functions.https.HttpsError('permission-denied', 'Only admin or class teacher can reset parent password.');
    }
    newPassword = generateTempPassword(8);
  } else if (targetData.role === 'classTeacher' || targetData.role === 'subjectTeacher') {
    // Only Admin can reset teacher
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only administrators can reset teacher passwords.');
    }
    newPassword = generateTempPassword(8);
  } else {
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only administrators can reset this account.');
    }
    newPassword = generateTempPassword(8);
  }

  // Update Firebase Auth password
  await auth.updateUser(targetUid, { password: newPassword });

  // Mark mustChangePassword = true
  await db.doc(`users/${targetUid}`).update({
    mustChangePassword: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  if (targetData.role === 'student') {
    await db.doc(`students/${targetUid}`).update({
      mustChangePassword: true
    });
  }

  return {
    success: true,
    loginId: targetData.loginId,
    name: targetData.name,
    role: targetData.role,
    newPassword
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. DEACTIVATE / REACTIVATE USER (Active status toggle)
// ─────────────────────────────────────────────────────────────────────────────
exports.setUserActiveStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const callerRole = context.auth.token.role;
  const callerClassId = context.auth.token.classId;
  const { targetUid, active } = data;

  if (!targetUid || typeof active !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'Target UID and boolean active status are required.');
  }

  const targetDoc = await db.doc(`users/${targetUid}`).get();
  if (!targetDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Target user not found.');
  }

  const targetData = targetDoc.data();

  // Permission check
  if (callerRole !== 'admin') {
    if (callerRole === 'classTeacher' && targetData.role === 'student' && targetData.classId === callerClassId) {
      // Allowed
    } else {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permission to change user active status.');
    }
  }

  // Disable/enable in Auth
  await auth.updateUser(targetUid, { disabled: !active });

  // Update in Firestore
  await db.doc(`users/${targetUid}`).update({
    active,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  if (targetData.role === 'student') {
    await db.doc(`students/${targetUid}`).update({ active });
  }

  return {
    success: true,
    uid: targetUid,
    active
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. INITIALIZE / SEED SCHOOL CONFIG & DEFAULT ADMIN
// ─────────────────────────────────────────────────────────────────────────────
exports.seedSchoolConfig = functions.https.onCall(async (data, context) => {
  const configRef = db.doc('school/config');
  const existingConfig = await configRef.get();

  if (!existingConfig.exists) {
    await configRef.set({
      name: 'RAVS Smart School',
      maxUsers: 500,
      currentUserCount: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Ensure default classes exist (Class 5th - 12th)
  const defaultClasses = [
    { classId: '5A', className: 'Class 5', section: 'A' },
    { classId: '6A', className: 'Class 6', section: 'A' },
    { classId: '7A', className: 'Class 7', section: 'A' },
    { classId: '8A', className: 'Class 8', section: 'A' },
    { classId: '9A', className: 'Class 9', section: 'A' },
    { classId: '10A', className: 'Class 10', section: 'A' },
    { classId: '11A', className: 'Class 11', section: 'A' },
    { classId: '12A', className: 'Class 12', section: 'A' }
  ];

  for (const cls of defaultClasses) {
    await db.doc(`classes/${cls.classId}`).set({
      ...cls,
      studentCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  return { success: true, message: 'School configuration and classes initialized.' };
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. AI DOUBT CHATBOT (Groq / Gemini server-side with Rule-Based FAQ Fallback)
// ─────────────────────────────────────────────────────────────────────────────
const SYLLABUS_FAQ_KNOWLEDGE = [
  {
    keywords: ['photosynthesis', 'photo synthesis', 'chlorophyll', 'plants make food'],
    answer: '🌿 **Photosynthesis** is the biological process by which green plants and algae synthesize glucose from carbon dioxide (CO₂) and water (H₂O) using sunlight trapped by chlorophyll.\n\n**Chemical Equation:**\n`6CO₂ + 6H₂O + Sunlight ➔ C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen)`\n\n*Key Stages:* Light-dependent reactions (in thylakoids) and Calvin cycle (in stroma).'
  },
  {
    keywords: ['pythagoras', 'pythagorean theorem', 'hypotenuse', 'right triangle'],
    answer: '📐 **Pythagoras Theorem:** In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.\n\n**Formula:**\n`c² = a² + b²`  *(where c = hypotenuse, a & b = legs)*\n\n*Example:* If a = 3 cm, b = 4 cm ➔ c² = 3² + 4² = 9 + 16 = 25 ➔ c = 5 cm.'
  },
  {
    keywords: ['newton laws', 'newtons laws of motion', 'first law', 'second law', 'third law', 'inertia'],
    answer: "⚛️ **Newton's Laws of Motion:**\n1. **1st Law (Law of Inertia):** An object remains at rest or in uniform motion unless acted upon by an external net force.\n2. **2nd Law (F = ma):** Force equals mass multiplied by acceleration (`F = m × a`).\n3. **3rd Law:** For every action, there is an equal and opposite reaction."
  },
  {
    keywords: ['cell', 'mitochondria', 'nucleus', 'cell wall', 'cytoplasm', 'powerhouse'],
    answer: '🔬 **Cell Organelles & Functions:**\n- **Mitochondria:** Powerhouse of the cell, generates energy in the form of ATP.\n- **Nucleus:** Control center of the cell containing genetic material (DNA).\n- **Chloroplasts:** Present only in plant cells for photosynthesis.\n- **Cell Wall:** Rigid outer boundary in plant cells providing structural support.'
  },
  {
    keywords: ['quadratic equation', 'quadratic formula', 'roots', 'ax2+bx+c'],
    answer: '🔢 **Quadratic Equations:** Standard form: `ax² + bx + c = 0` (where a ≠ 0).\n\n**Quadratic Formula:**\n`x = [-b ± √(b² - 4ac)] / 2a`\n\n- Discriminant `D = b² - 4ac`\n- If `D > 0`: Two distinct real roots\n- If `D = 0`: Two equal real roots\n- If `D < 0`: Complex / imaginary roots'
  },
  {
    keywords: ['water cycle', 'evaporation', 'condensation', 'precipitation'],
    answer: '💧 **The Water Cycle (Hydrological Cycle):**\n1. **Evaporation & Transpiration:** Solar heat converts water into vapor from oceans and plants.\n2. **Condensation:** Water vapor cools into clouds in the atmosphere.\n3. **Precipitation:** Condensed droplets fall as rain, snow, or hail.\n4. **Collection / Infiltration:** Water replenishes groundwater and rivers.'
  }
];

exports.askAIDoubtAssistant = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in to ask doubts.');
  }

  const { question, classId, subject } = data;
  if (!question || !question.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Question text is required.');
  }

  const cleanQuestion = question.trim().toLowerCase();

  // 1. Check for LLM API Key on Server (Groq / Gemini)
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are the RAVS Smart School AI Study Assistant for Class ${classId || '8'} in ${subject || 'General Academic'}. Provide clear, step-by-step, encouraging academic answers in Semi-English format suitable for school curriculum.`
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.6,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const json = await response.json();
        const reply = json.choices?.[0]?.message?.content;
        if (reply) {
          return { success: true, answer: reply, source: 'groq-llama' };
        }
      }
    } catch (err) {
      console.warn('Groq API invocation error, falling back to FAQ:', err.message);
    }
  }

  // 2. Rule-Based FAQ Fallback
  for (const item of SYLLABUS_FAQ_KNOWLEDGE) {
    const isMatch = item.keywords.some((kw) => cleanQuestion.includes(kw));
    if (isMatch) {
      return {
        success: true,
        answer: item.answer,
        source: 'curriculum-faq'
      };
    }
  }

  // 3. Default Encouraging School Response
  return {
    success: true,
    answer: `💡 **Study Guidance for "${question}":**\n\nFor a complete derivation or detailed lesson review on this topic in Class ${classId || '8'}, check the **Class Notes & Handouts** section or post your specific question directly to your Class Teacher during classroom interactive hours!`,
    source: 'school-guidance'
  };
});

