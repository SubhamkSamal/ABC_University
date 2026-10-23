
const courseTable = document.getElementById("course-table");
const courseCount = document.getElementById("course-count");
const tableStatus = document.getElementById("table-status");
const courseSearch = document.getElementById("course-search");

const API_URL = "http://127.0.0.1:5000/api/courses";

let allCourses = [];

// Fetch course data from the Flask backend
async function loadCourses() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const courses = await response.json();

        if (!Array.isArray(courses)) {
            throw new Error("The API did not return a course list.");
        }

        allCourses = courses;

        displayCourses(allCourses);

        tableStatus.textContent =
            `Successfully loaded ${allCourses.length} courses.`;

    } catch (error) {
        console.error("Could not load courses:", error);

        courseCount.textContent = "—";
        tableStatus.textContent =
            "Unable to load courses. Make sure the Flask server is running.";

        courseTable.replaceChildren();
    }
}


// Display the supplied courses as table rows
function displayCourses(courses) {
    courseTable.replaceChildren();

    courseCount.textContent = courses.length;

    if (courses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-message";
        cell.textContent = "No matching courses found.";

        row.appendChild(cell);
        courseTable.appendChild(row);

        return;
    }

    courses.forEach(course => {
        const row = document.createElement("tr");

        const values = [
            course.course_id,
            course.course_name,
            course.department,
            course.credits,
            course.instructor
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");

            // Use textContent so database values are treated as text.
            cell.textContent = value ?? "—";

            if (index === 0) {
                cell.className = "course-code";
            }

            if (index === 3) {
                cell.className = "credits-cell";
            }

            row.appendChild(cell);
        });

        courseTable.appendChild(row);
    });
}


// Filter courses as the user types
courseSearch.addEventListener("input", () => {
    const searchTerm = courseSearch.value.trim().toLowerCase();

    const filteredCourses = allCourses.filter(course => {
        return [
            course.course_id,
            course.course_name,
            course.department,
            course.credits,
            course.instructor
        ].some(value =>
            String(value ?? "").toLowerCase().includes(searchTerm)
        );
    });

    displayCourses(filteredCourses);

    tableStatus.textContent =
        `Showing ${filteredCourses.length} of ${allCourses.length} courses.`;
});


// Load the courses when the page opens
loadCourses();
