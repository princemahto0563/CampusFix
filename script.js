/*********************************
 * FIREBASE INIT
 *********************************/
console.log("SCRIPT LOADED");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBd_-AfXVXyb69XuqsNoLh63bRZS43CZrU",
  authDomain: "campusfix-665bb.firebaseapp.com",
  projectId: "campusfix-665bb",
  storageBucket: "campusfix-665bb.firebasestorage.app",
  messagingSenderId: "631552912224",
  appId: "1:631552912224:web:281fb4c04f1cede0150c05",
  measurementId: "G-7P0LKKJGV2"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

/*********************************
 * SUBMIT ISSUE (STUDENT)
 *********************************/
function submitIssue() {
  const titleEl = document.getElementById("title");
  const descEl = document.getElementById("desc");
  const categoryEl = document.getElementById("category");
  const priorityEl = document.getElementById("priority");

  if (!titleEl || !descEl || !categoryEl || !priorityEl) return;

  const title = titleEl.value.trim();
  const desc = descEl.value.trim();
  const category = categoryEl.value;
  const priority = priorityEl.value;

  if (!title || !desc) {
    alert("Please fill all fields");
    return;
  }

  const issueData = {
    title: title,
    description: desc,
    category: category,
    priority: priority,
    status: "Pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    resolvedAt: null
  };

  db.collection("issues")
    .add(issueData)
    .then(() => {
      titleEl.value = "";
      descEl.value = "";
      categoryEl.value = "Electrical";
      priorityEl.value = "Low";

      const msg = document.getElementById("successMsg");
      if (msg) {
        msg.innerText = "✅ Issue submitted successfully!";
        msg.style.display = "block";
        setTimeout(() => (msg.style.display = "none"), 3000);
      }
    })
    .catch(err => {
      console.error("Firestore Error:", err);
      alert("Error submitting issue");
    });
}

/*********************************
 * ADMIN LOGIN
 *********************************/
let auth = null;
if (typeof firebase.auth === "function") {
  auth = firebase.auth();
}

function adminLogin() {
  if (!auth) return;

  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("loginOverlay").style.display = "none";
    })
    .catch(err => alert(err.message));
}

/*********************************
 * ADMIN FILTER
 *********************************/
let currentFilter = "All";

function filterIssues(status) {
  currentFilter = status;
}

/*********************************
 * ADMIN DASHBOARD (REALTIME)
 *********************************/
if (document.getElementById("issues")) {
  const issuesDiv = document.getElementById("issues");
  const totalEl = document.getElementById("total");
  const pendingEl = document.getElementById("pending");
  const resolvedEl = document.getElementById("resolved");

  db.collection("issues")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      issuesDiv.innerHTML = "";

      let total = 0,
        pending = 0,
        resolved = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        total++;

        if (data.status === "Resolved") resolved++;
        else pending++;

        if (currentFilter !== "All" && data.status !== currentFilter) return;

        const priorityColor =
          data.priority === "High"
            ? "red"
            : data.priority === "Medium"
            ? "orange"
            : "green";

        issuesDiv.innerHTML += `
          <div class="issue">
            <h4>${data.title}</h4>
            <p>${data.description}</p>

            <p><b>Category:</b> ${data.category}</p>
            <p>
              <b>Priority:</b>
              <span style="color:${priorityColor};font-weight:600;">
                ${data.priority}
              </span>
            </p>

            <small>
              📅 Created: ${
                data.createdAt
                  ? data.createdAt.toDate().toLocaleString()
                  : "-"
              }
            </small>
            <br><br>

            ${
              data.status === "Resolved"
                ? `<span style="color:green;font-weight:600;">✅ Resolved</span>
                   <br>
                   <small>
                     ⏱ ${
                       data.resolvedAt
                         ? data.resolvedAt.toDate().toLocaleString()
                         : "-"
                     }
                   </small>`
                : `<button onclick="resolveIssue('${doc.id}')">
                     Mark Resolved
                   </button>`
            }
          </div>
        `;
      });

      totalEl.innerText = total;
      pendingEl.innerText = pending;
      resolvedEl.innerText = resolved;
    });
}

/*********************************
 * MARK ISSUE RESOLVED
 *********************************/
function resolveIssue(id) {
  db.collection("issues").doc(id).update({
    status: "Resolved",
    resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}
