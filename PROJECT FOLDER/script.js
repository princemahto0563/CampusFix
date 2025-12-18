// script.js - FINAL COMPLETE HACKATHON-READY VERSION (December 18, 2025)
// GovQueue: Smart Queue & Appointment System for Government Services
// Fully All-India scalable | Firebase Integrated | Premium UI | Interactive Admin Dashboard

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Complete Indian States & Union Territories (sorted alphabetically)
const states = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
].sort();

// Comprehensive Districts - Major cities across key states + fallback
const districts = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Anantapur', 'Kadapa', 'Chittoor', 'East Godavari', 'West Godavari'],
    'Maharashtra': ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Sangli', 'Ahmednagar'],
    'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi', 'Davangere', 'Ballari'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'North West Delhi', 'South West Delhi', 'South East Delhi'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur Nagar', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Gorakhpur', 'Noida', 'Bareilly'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Jamnagar', 'Bhavnagar', 'Junagadh'],
    'Kerala': ['Thiruvananthapuram', 'Ernakulam', 'Kochi', 'Kozhikode', 'Thrissur', 'Malappuram', 'Kollam', 'Kannur'],
    'Telangana': ['Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Warangal Urban', 'Khammam', 'Nalgonda'],
    'West Bengal': ['Kolkata', 'Howrah', 'North 24 Parganas', 'South 24 Parganas', 'Hooghly', 'Paschim Bardhaman'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Sikar'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
    'Haryana': ['Gurugram', 'Faridabad', 'Hisar', 'Panipat', 'Ambala', 'Karnal'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Puri', 'Sambalpur', 'Rourkela'],
    '*': ['District Headquarters', 'Main City District'] // Fallback for unsupported states
};

// Realistic Government Institutions (Banks & Hospitals)
const institutions = {
    'Government Bank': {
        'Mumbai City': ['State Bank of India - Fort', 'Bank of Baroda - Nariman Point', 'Central Bank - Churchgate', 'PNB - Fort'],
        'Mumbai Suburban': ['SBI - Andheri', 'Bank of India - Borivali', 'Canara Bank - Ghatkopar', 'Union Bank - Malad'],
        'Pune': ['SBI - Shivajinagar', 'Bank of Maharashtra - Deccan', 'PNB - Camp'],
        'Bengaluru Urban': ['SBI - MG Road', 'Canara Bank - Jayanagar', 'Bank of Baroda - Koramangala'],
        'Chennai': ['SBI - Anna Salai', 'Indian Overseas Bank - Mount Road'],
        'New Delhi': ['SBI - Parliament Street', 'PNB - Connaught Place'],
        'Hyderabad': ['SBI - Abids', 'Andhra Bank - Basheerbagh'],
        'Kolkata': ['SBI - Strand Road', 'United Bank of India - Dalhousie'],
        '*': ['State Bank of India - Main Branch', 'Punjab National Bank', 'Bank of India', 'Canara Bank', 'Union Bank of India']
    },
    'Government Hospital': {
        'Mumbai City': ['Sir J.J. Group of Hospitals', 'Gokuldas Tejpal Hospital', 'St. George\'s Hospital'],
        'Mumbai Suburban': ['KEM Hospital', 'Sion Hospital', 'Cooper Hospital'],
        'Pune': ['Sassoon General Hospital', 'Naidu Hospital'],
        'Bengaluru Urban': ['Victoria Hospital', 'Bowring Hospital', 'Vani Vilas Hospital'],
        'Chennai': ['Rajiv Gandhi Government General Hospital', 'Kilpauk Medical College Hospital'],
        'New Delhi': ['AIIMS New Delhi', 'Safdarjung Hospital', 'RML Hospital', 'Lok Nayak Hospital'],
        'Hyderabad': ['Osmania General Hospital', 'Gandhi Hospital'],
        'Kolkata': ['R.G. Kar Medical College', 'Calcutta Medical College'],
        'Lucknow': ['KGMU', 'SGPGI'],
        '*': ['District Civil Hospital', 'Government General Hospital', 'Taluka Hospital', 'Community Health Centre']
    }
};

const averageServiceTime = 10; // minutes per appointment

function populateSelect(id, options) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">Select</option>';
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
}

// ==================== USER FLOW PAGES ====================

// Page: index.html - Appointment Selection
if (document.getElementById('appointmentForm')) {
    populateSelect('state', states);

    document.getElementById('state').addEventListener('change', (e) => {
        const state = e.target.value;
        const dists = districts[state] || districts['*'] || [];
        populateSelect('district', dists.sort());
        document.getElementById('institution').innerHTML = '<option value="">Select Institution</option>';
    });

    document.getElementById('district').addEventListener('change', (e) => {
        const district = e.target.value;
        const serviceType = document.getElementById('serviceType').value;
        if (!serviceType) {
            alert('Please select Service Type first');
            return;
        }
        const insts = institutions[serviceType][district] || institutions[serviceType]['*'] || ['No institutions available'];
        populateSelect('institution', insts);
    });

    document.getElementById('appointmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            serviceType: document.getElementById('serviceType').value,
            state: document.getElementById('state').value,
            district: document.getElementById('district').value,
            institution: document.getElementById('institution').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value
        };
        if (!data.institution || data.institution.includes('No institutions')) {
            alert('Please select a valid institution');
            return;
        }
        localStorage.setItem('appointmentData', JSON.stringify(data));
        window.location.href = 'verification.html';
    });
}

// Page: verification.html
if (document.getElementById('verificationForm')) {
    const appointmentData = JSON.parse(localStorage.getItem('appointmentData'));
    if (!appointmentData) window.location.href = 'index.html';

    let generatedOtp = null;

    document.getElementById('sendOtp').addEventListener('click', () => {
        generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('%c Demo OTP: ' + generatedOtp, 'color: red; font-size: 20px;');
        alert('OTP Sent! (Check browser console for demo OTP)');
        document.getElementById('otpSection').style.display = 'block';
        document.getElementById('verifyBtn').style.display = 'block';
    });

    document.getElementById('verificationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('otp').value !== generatedOtp) {
            alert('Invalid OTP');
            return;
        }

        const userData = {
            fullName: document.getElementById('fullName').value,
            mobile: document.getElementById('mobile').value,
            email: document.getElementById('email').value,
            ...appointmentData,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const snapshot = await db.collection('appointments')
            .where('institution', '==', userData.institution)
            .where('date', '==', userData.date)
            .orderBy('queueNumber', 'desc')
            .limit(1)
            .get();

        userData.queueNumber = snapshot.empty ? 1 : (snapshot.docs[0].data().queueNumber + 1);
        userData.waitingTime = (userData.queueNumber - 1) * averageServiceTime;
        userData.token = `GQ-${String(userData.queueNumber).padStart(4, '0')}`;

        await db.collection('appointments').add(userData);

        localStorage.setItem('confirmationData', JSON.stringify(userData));
        window.location.href = 'confirmation.html';
    });
}

// Page: confirmation.html
if (document.getElementById('confirmationDetails')) {
    const data = JSON.parse(localStorage.getItem('confirmationData'));
    if (!data) window.location.href = 'index.html';

    document.getElementById('confirmationDetails').innerHTML = `
        <h4 class="text-success">Appointment Confirmed Successfully!</h4>
        <hr>
        <p><strong>Service:</strong> ${data.serviceType}</p>
        <p><strong>Institution:</strong> ${data.institution}</p>
        <p><strong>Location:</strong> ${data.district}, ${data.state}</p>
        <p><strong>Date & Time:</strong> ${new Date(data.date).toLocaleDateString('en-IN')} at ${data.time}</p>
        <p><strong>Your Token:</strong> <span class="badge bg-primary fs-3">${data.token}</span></p>
        <p><strong>Estimated Waiting Time:</strong> ${data.waitingTime} minutes</p>
        <div class="alert alert-info mt-4">
            You will receive SMS & Email reminders: 1 day before, 2 hours before, and 1 hour before your appointment.<br>
            <small>(Architecture ready via Firebase Cloud Functions → Twilio/SendGrid)</small>
        </div>
    `;
    localStorage.clear();
}

// ==================== ADMIN DASHBOARD - FULLY INTERACTIVE ====================

if (document.getElementById('adminLoginForm')) {
    let allAppointments = [];

    document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('dashboardSection').style.display = 'block';
                loadDashboard();
            })
            .catch(err => alert('Login Failed: ' + err.message));
    });

    function loadDashboard() {
        db.collection('appointments')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                allAppointments = [];
                let total = 0, pending = 0, completed = 0;

                snapshot.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() };
                    allAppointments.push(data);
                    total++;
                    if (data.status === 'pending') pending++;
                    if (data.status === 'completed') completed++;
                });

                updateStats(total, pending, completed);
                renderTable(allAppointments);
            });
    }

    function updateStats(total, pending, completed) {
        document.getElementById('totalAppointments').textContent = total;
        document.getElementById('pendingAppointments').textContent = pending;
        document.getElementById('completedAppointments').textContent = completed;

        const today = new Date().toISOString().slice(0, 10);
        const todayPending = allAppointments.filter(a => a.date === today && a.status === 'pending').length;
        const progress = total > 0 ? Math.round((pending / total) * 100) : 0;
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressBar').textContent = progress + '%';
        document.getElementById('todayLoad').textContent = `Today's Pending: ${todayPending}`;
    }

    function renderTable(appointments) {
        const tbody = document.getElementById('appointmentsTable');
        tbody.innerHTML = '';

        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No appointments found</td></tr>';
            return;
        }

        appointments.forEach(app => {
            const isPending = app.status === 'pending';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="badge bg-primary fs-6">${app.token}</span></td>
                <td><strong>${app.fullName}</strong><br><small>${app.mobile}</small></td>
                <td>${app.institution}<br><small class="text-muted">${app.district}, ${app.state}</small></td>
                <td>${new Date(app.date).toLocaleDateString('en-IN')}<br><strong>${app.time}</strong></td>
                <td><strong>${app.waitingTime} min</strong><br>Queue #${app.queueNumber}</td>
                <td><span class="badge bg-${isPending ? 'warning' : 'success'}">${app.status.toUpperCase()}</span></td>
                <td>
                    ${isPending 
                        ? `<button class="btn btn-success btn-sm me-2" onclick="markCompleted('${app.id}')">Complete</button>`
                        : '<span class="text-success">Done</span>'
                    }
                    <button class="btn btn-info btn-sm" onclick="viewDetails('${app.id}')">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    window.markCompleted = async (id) => {
        if (confirm('Mark this appointment as completed?')) {
            await db.collection('appointments').doc(id).update({
                status: 'completed',
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    };

    window.viewDetails = (id) => {
        const app = allAppointments.find(a => a.id === id);
        if (!app) return;

        document.getElementById('detailModalBody').innerHTML = `
            <p><strong>Name:</strong> ${app.fullName}</p>
            <p><strong>Mobile:</strong> ${app.mobile}</p>
            <p><strong>Email:</strong> ${app.email}</p>
            <hr>
            <p><strong>Service:</strong> ${app.serviceType}</p>
            <p><strong>Institution:</strong> ${app.institution}</p>
            <p><strong>Location:</strong> ${app.district}, ${app.state}</p>
            <p><strong>Date & Time:</strong> ${new Date(app.date).toLocaleDateString('en-IN')} at ${app.time}</p>
            <p><strong>Token:</strong> <span class="badge bg-primary fs-4">${app.token}</span></p>
            <p><strong>Wait Time:</strong> ${app.waitingTime} minutes (#${app.queueNumber} in queue)</p>
            <p><strong>Status:</strong> <span class="badge bg-${app.status === 'pending' ? 'warning' : 'success'}">${app.status}</span></p>
            <p><strong>Booked:</strong> ${app.createdAt ? new Date(app.createdAt.toDate()).toLocaleString('en-IN') : 'N/A'}</p>
        `;
        new bootstrap.Modal(document.getElementById('detailModal')).show();
    };

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allAppointments.filter(app =>
            app.fullName.toLowerCase().includes(query) ||
            app.token.toLowerCase().includes(query) ||
            app.mobile.includes(query) ||
            app.institution.toLowerCase().includes(query)
        );
        renderTable(filtered);
    });

    // Status Filter
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        const val = e.target.value;
        let filtered = allAppointments;
        if (val === 'pending') filtered = allAppointments.filter(a => a.status === 'pending');
        if (val === 'completed') filtered = allAppointments.filter(a => a.status === 'completed');
        renderTable(filtered);
    });

    // Date Filter
    document.getElementById('dateFilter').addEventListener('change', (e) => {
        const date = e.target.value;
        if (!date) {
            renderTable(allAppointments);
            return;
        }
        const filtered = allAppointments.filter(a => a.date === date);
        renderTable(filtered);
    });
}