// API endpoints
const TEACHER_API = "http://127.0.0.1:5000/api/teacher";
const STUDENT_API = "http://127.0.0.1:5000/api/students";

// Login elements
const teacherForm = document.getElementById("teacher-form");
const teacherIdInput = document.getElementById("teacher-id");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

// Dashboard elements
const studentDashboard = document.getElementById("student-dashboard");
const welcomeHeading = document.getElementById("welcome-heading");
const studentTable = document.getElementById("student-table");
const studentCount = document.getElementById("student-count");
const tableMessage = document.getElementById("table-message");
const studentSearch = document.getElementById("student-search");
const logoutButton = document.getElementById("logout-button");

let allStudents = [];


// Handle teacher login
teacherForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const enteredId = teacherIdInput.value.trim();

    if (!enteredId) {
        loginMessage.textContent = "Please enter your Teacher ID.";
        loginMessage.className = "message error";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Verifying...";
    loginMessage.textContent = "";

    try {
        // Step 1: Get the teacher records from the backend
        const teacherResponse = await fetch(TEACHER_API);

        if (!teacherResponse.ok) {
            throw new Error(
                `Teacher API returned status ${teacherResponse.status}`
            );
        }

        const teachers = await teacherResponse.json();

        if (!Array.isArray(teachers)) {
            throw new Error("The teacher API did not return a list.");
        }

        // Step 2: Find the teacher whose ID matches the entered ID
        const teacher = teachers.find(function (item) {
            const id = item.teacher_id ?? item.id;
            return String(id ?? "").trim() === enteredId;
        });

        if (!teacher) {
            loginMessage.textContent =
                "Invalid Teacher ID. Please check your ID and try again.";
            loginMessage.className = "message error";
            return;
        }

        // Step 3: The ID is valid, so fetch student records
        loginMessage.textContent = "Teacher verified. Loading students...";
        loginMessage.className = "message success";

        const studentResponse = await fetch(STUDENT_API);

        if (!studentResponse.ok) {
            throw new Error(
                `Student API returned status ${studentResponse.status}`
            );
        }

        const students = await studentResponse.json();

        if (!Array.isArray(students)) {
            throw new Error("The student API did not return a list.");
        }

        // Step 4: Display the teacher's name and student data
        const teacherName = teacher.name ?? teacher.teacher_name ?? "Teacher";

        welcomeHeading.textContent = `Welcome, ${teacherName}!`;

        allStudents = students;
        displayStudents(allStudents);

        studentSearch.value = "";
        studentDashboard.hidden = false;

        loginMessage.textContent = "";
        loginMessage.className = "message";

        // Hide the login form after successful login
        document.getElementById("login-card").hidden = true;

        // Bring the dashboard into view
        studentDashboard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error("Login error:", error);

        loginMessage.textContent =
            "Could not connect to the server. Check that Flask is running and both API URLs are correct.";

        loginMessage.className = "message error";

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Access Student Records";
    }
});


// Display student records in the table
function displayStudents(students) {
    studentTable.replaceChildren();

    studentCount.textContent = students.length;

    if (students.length === 0) {
        showTableMessage("No student records were found.");
        return;
    }

    showTableMessage("");

    students.forEach(function (student) {
        const row = document.createElement("tr");

        const values = [
            student.student_id,
            student.name,
            student.age,
            student.gender,
            student.email,
            student.department
        ];

        values.forEach(function (value, index) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "—";

            if (index === 0) {
                cell.className = "student-id";
            }

            row.appendChild(cell);
        });

        studentTable.appendChild(row);
    });
}


// Display a message below the table
function showTableMessage(message) {
    tableMessage.textContent = message;
}


// Search students as the teacher types
studentSearch.addEventListener("input", function () {
    const searchTerm = studentSearch.value.trim().toLowerCase();

    const filteredStudents = allStudents.filter(function (student) {
        const searchableValues = [
            student.student_id,
            student.name,
            student.age,
            student.gender,
            student.email,
            student.department
        ];

        return searchableValues.some(function (value) {
            return String(value ?? "")
                .toLowerCase()
                .includes(searchTerm);
        });
    });

    displayStudents(filteredStudents);

    if (filteredStudents.length > 0) {
        showTableMessage(
            `Showing ${filteredStudents.length} of ${allStudents.length} students.`
        );
    } else {
        showTableMessage("No students match your search.");
    }
});


// Log out and return to the Teacher ID form
logoutButton.addEventListener("click", function () {
    allStudents = [];

    studentDashboard.hidden = true;
    document.getElementById("login-card").hidden = false;

    teacherForm.reset();
    studentSearch.value = "";

    studentTable.replaceChildren();
    studentCount.textContent = "0";

    loginMessage.textContent = "";
    loginMessage.className = "message";

    teacherIdInput.focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});