// Initialization: Format premium date standard format on header UI
document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
});

// Dynamic array mapping synchronized directly with localized caching matrix state
let students = JSON.parse(localStorage.getItem('advanced_students')) || [];

function saveState() {
    localStorage.setItem('advanced_students', JSON.stringify(students));
}

// Workspace tab interface layout router
function switchSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });

    const titles = {
        'dashboard': 'Dashboard Metrics',
        'add-student': 'Student Onboarding Engine',
        'view-students': 'Student Database Directory'
    };
    document.getElementById('page-title').innerText = titles[sectionId];
    
    updateDashboard();
    renderStudentsTable();
}

// Student Form Event Subscriptions Logic mapping
document.getElementById('student-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const rollNo = document.getElementById('student-id').value.trim();
    
    if(students.some(student => student.id.toLowerCase() === rollNo.toLowerCase())) {
        alert("Operation Aborted: A student record with this Roll/ID number already exists!");
        return;
    }

    let imgUrl = document.getElementById('student-img-url').value.trim();
    if(!imgUrl) {
        imgUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(rollNo)}`;
    }

    const newStudentObj = {
        id: rollNo,
        name: document.getElementById('student-name').value.trim(),
        classGrade: document.getElementById('student-class').value,
        course: document.getElementById('student-course').value,
        email: document.getElementById('student-email').value.trim(),
        phone: document.getElementById('student-phone').value.trim(),
        guardian: document.getElementById('guardian-name').value.trim(),
        photo: imgUrl
    };

    students.push(newStudentObj);
    saveState();
    this.reset();
    
    if(document.getElementById('search-bar')) document.getElementById('search-bar').value = '';
    if(document.getElementById('filter-class')) document.getElementById('filter-class').value = 'All';
    
    switchSection('view-students');
});

// Core DOM Rendering Engine compiling the Student table lines
function renderStudentsTable(recordsToRender = students) {
    const tableBody = document.getElementById('students-list');
    tableBody.innerHTML = '';

    if(recordsToRender.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; padding: 40px; font-weight:500;">No matching student profiles found in cache directory.</td></tr>`;
        return;
    }

    recordsToRender.forEach(student => {
        const rowHTML = document.createElement('tr');
        rowHTML.innerHTML = `
            <td>
                <div class="student-profile-cell">
                    <img src="${student.photo}" class="student-thumbnail" alt="Avatar">
                    <div class="profile-name-container">
                        <span class="main-name">${student.name}</span>
                    </div>
                </div>
            </td>
            <td><b>${student.id}</b></td>
            <td><span class="badge-class">${student.classGrade}</span></td>
            <td><span class="badge-course">${student.course || 'Unassigned'}</span></td>
            <td>${student.guardian}</td>
            <td>
                <div class="contact-info-block">
                    <strong>P:</strong> ${student.phone}<br>
                    <span style="font-size:12px; color:#64748b">${student.email}</span>
                </div>
            </td>
            <td>
                <div class="action-buttons-group">
                    <button class="btn-action-view" onclick="openDetailsModal('${student.id}')">View Profile</button>
                    <button class="btn-action-delete" onclick="deleteStudentRecord('${student.id}')">Erase</button>
                </div>
            </td>
        `;
        tableBody.appendChild(rowHTML);
    });
}

// Live Search filtering logic parsing user queries
function filterRoster() {
    const query = document.getElementById('search-bar').value ? document.getElementById('search-bar').value.toLowerCase().trim() : '';
    const classFilter = document.getElementById('filter-class') ? document.getElementById('filter-class').value : 'All';

    const filtered = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query);
        const matchesClass = (classFilter === 'All') || (student.classGrade === classFilter);
        return matchesSearch && matchesClass;
    });

    renderStudentsTable(filtered);
}

// Populating and launching the customized individual profile view overlay card modal
function openDetailsModal(targetId) {
    const student = students.find(s => s.id === targetId);
    if(!student) return;

    const modalContent = document.getElementById('modal-card-content');
    modalContent.innerHTML = `
        <div class="id-card-modal">
            <img src="${student.photo}" alt="Student Photo">
            <h3>${student.name}</h3>
            <span class="id-badge">ID: ${student.id}</span>
            <div class="id-details-list">
                <p><strong>Assigned Class:</strong> ${student.classGrade}</p>
                <p><strong>Enrolled Course:</strong> ${student.course || 'Unassigned'}</p>
                <p><strong>Primary Contact:</strong> ${student.phone}</p>
                <p><strong>Email Address:</strong> ${student.email}</p>
                <p><strong>Emergency Guardian:</strong> ${student.guardian}</p>
            </div>
        </div>
    `;
    document.getElementById('details-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('details-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('details-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function deleteStudentRecord(targetId) {
    if(confirm(`Are you certain you want to permanently erase student record ${targetId}?`)) {
        students = students.filter(student => student.id !== targetId);
        saveState();
        filterRoster();
        updateDashboard();
    }
}

function exportCSV() {
    if(students.length === 0) {
        alert("Data array empty: No record rows present to output into a sheet file.");
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Roll Number,Full Name,Class,Enrolled Course,Email,Phone,Guardian Name\n";
    
    students.forEach(s => {
        let row = `"${s.id}","${s.name}","${s.classGrade}","${s.course || 'Unassigned'}","${s.email}","${s.phone}","${s.guardian}"`;
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EduManage_Roster_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function updateDashboard() {
    const totalElem = document.getElementById('total-students-count');
    if(totalElem) {
        totalElem.innerText = students.length;
    }
}

function openCoursesModal() {
    const modalContent = document.getElementById('modal-card-content');
    
    const courses = [
        { code: "CS-101", name: "Introduction to Computer Science", track: "Class 9 & 10" },
        { code: "MATH-202", name: "Advanced Coordinate Geometry", track: "Class 11 & 12" },
        { code: "PHYS-301", name: "Quantum Mechanics & Optics", track: "Class 12" },
        { code: "DBMS-404", name: "Relational Database Foundations", track: "Class 11" },
        { code: "JAVA-102", name: "Object-Oriented Programming Structure", track: "Class 10 & 11" }
    ];

    let coursesHTML = `
        <div class="id-card-modal" style="padding-top: 0;">
            <div style="font-size: 40px; margin-bottom: 10px;">📚</div>
            <h3 style="margin-bottom: 5px;">Active Curriculum Roster</h3>
            <span class="id-badge" style="margin-bottom: 15px;">Live Academic Tracks</span>
            <div class="id-details-list" style="max-height: 300px; overflow-y: auto; background: #fff; padding: 5px 0; border: none;">
    `;

    courses.forEach(course => {
        coursesHTML += `
            <div style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #0f172a; font-size: 14px; display: block;">${course.name}</strong>
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;">Code: ${course.code}</span>
                </div>
                <span class="badge-class" style="margin: 0; font-size: 11px; white-space: nowrap;">${course.track}</span>
            </div>
        `;
    });

    coursesHTML += `
            </div>
        </div>
    `;

    modalContent.innerHTML = coursesHTML;
    document.getElementById('details-modal').style.display = 'flex';
}

// --- DYNAMIC SECURITY AUTHENTICATION SYSTEMS CORE ---
let authState = "signin"; // Options: "signin", "signup", "forgot"

document.addEventListener("DOMContentLoaded", () => {
    const activeSession = sessionStorage.getItem("admin_session");
    if (activeSession) {
        document.getElementById("auth-container").style.display = "none";
        const adminData = JSON.parse(activeSession);
        document.querySelector(".subtitle").innerText = `Welcome back, ${adminData.name || 'Administrator'}`;
    }
    updateDashboard();
});

function toggleAuthMode(e) {
    if (e) e.preventDefault();
    authState = (authState === "signup") ? "signin" : "signup";
    applyAuthInterfaceState();
}

function toggleForgotMode(e) {
    if (e) e.preventDefault();
    authState = (authState === "forgot") ? "signin" : "forgot";
    applyAuthInterfaceState();
}

function applyAuthInterfaceState() {
    const title = document.getElementById("auth-title");
    const subtitle = document.getElementById("auth-subtitle");
    const submitBtn = document.getElementById("auth-submit-btn");
    const switchText = document.getElementById("auth-switch-text");
    const forgotLink = document.getElementById("forgot-password-link");
    
    const nameGroup = document.getElementById("reg-name-group");
    const passwordGroup = document.getElementById("auth-password-group");

    document.getElementById("auth-email").value = "";
    document.getElementById("auth-password").value = "";
    document.getElementById("auth-username").value = "";

    if (authState === "signup") {
        title.innerText = "Create Admin Credentials";
        subtitle.innerText = "Register the master supervisor credentials directory storage key.";
        submitBtn.innerText = "Complete Registration";
        switchText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode(event)">Sign In here</a>';
        
        nameGroup.style.display = "block";
        document.getElementById("auth-username").required = true;
        passwordGroup.style.display = "block";
        document.getElementById("auth-password").required = true;
        forgotLink.style.display = "none";

    } else if (authState === "forgot") {
        title.innerText = "Recover Access Code";
        subtitle.innerText = "Enter matching Admin Name and System Email matching your registry details to fetch your password.";
        submitBtn.innerText = "Verify Identities";
        switchText.innerHTML = 'Remember password? <a href="#" onclick="toggleForgotMode(event)">Back to Sign In</a>';
        
        nameGroup.style.display = "block";
        document.getElementById("auth-username").required = true;
        passwordGroup.style.display = "none";
        document.getElementById("auth-password").required = false;
        forgotLink.style.display = "none";

    } else {
        title.innerText = "Welcome to EduManage Pro";
        subtitle.innerText = "Please sign in to access the enterprise core dashboard.";
        submitBtn.innerText = "Sign In";
        switchText.innerHTML = 'Don\'t have an admin account? <a href="#" onclick="toggleAuthMode(event)">Register here</a>';
        
        nameGroup.style.display = "none";
        document.getElementById("auth-username").required = false;
        passwordGroup.style.display = "block";
        document.getElementById("auth-password").required = true;
        forgotLink.style.display = "block";
    }
}

document.getElementById("auth-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("auth-email").value.trim().toLowerCase();
    const username = document.getElementById("auth-username").value.trim();
    const password = document.getElementById("auth-password").value;
    const systemAdmins = JSON.parse(localStorage.getItem("system_admins")) || [];
    
    if (authState === "signup") {
        if (systemAdmins.some(admin => admin.email === email)) {
            alert("Error: An account configuration profile containing this email keyword already exists.");
            return;
        }
        
        const newAdmin = {
            name: username,
            email: email,
            password: password
        };
        
        systemAdmins.push(newAdmin);
        localStorage.setItem("system_admins", JSON.stringify(systemAdmins));
        alert("Registration Complete! Switching over to sign-in workspace.");
        
        this.reset();
        authState = "signin";
        applyAuthInterfaceState();

    } else if (authState === "forgot") {
        if (email === "admin@school.com" && username.toLowerCase() === "system admin") {
            alert("Identity Verified! Default system credentials are:\n\nPassword: admin123");
            authState = "signin";
            applyAuthInterfaceState();
            return;
        }

        const recoveredAccount = systemAdmins.find(admin => admin.email === email && admin.name.toLowerCase() === username.toLowerCase());

        if (recoveredAccount) {
            alert(`Identity Verified successfully, ${recoveredAccount.name}!\n\nYour stored security password is: ${recoveredAccount.password}`);
            this.reset();
            authState = "signin";
            applyAuthInterfaceState();
        } else {
            alert("Verification Failed: No records matching this Name and Email combo were found in directory keys.");
        }

    } else {
        const matchedAdmin = systemAdmins.find(admin => admin.email === email && admin.password === password);
        
        if (matchedAdmin || (email === "admin@school.com" && password === "admin123")) {
            const sessionPayload = matchedAdmin || { name: "System Admin", email: "admin@school.com" };
            sessionStorage.setItem("admin_session", JSON.stringify(sessionPayload));
            
            document.getElementById("auth-container").style.display = "none";
            document.querySelector(".subtitle").innerText = `Welcome back, ${sessionPayload.name}`;
            this.reset();
            updateDashboard();
        } else {
            alert("Access Denied: Invalid System Identity Credentials combination key provided.");
        }
    }
});

function executeSystemLogout() {
    sessionStorage.removeItem("admin_session");
    window.location.reload();
}