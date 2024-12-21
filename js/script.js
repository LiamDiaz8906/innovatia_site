const apiBaseUrl = "https://repoapi.ordenaris.com/api";
const projectKey = "a6093c23ae10457c8t0b8b298fc8b500";

///////////// API Token /////////////////////////
async function getToken(email) {
  try {
    const response = await fetch(`${apiBaseUrl}/candidato`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ordProyecto: projectKey,
      },
      body: JSON.stringify({ correo: email }),
    });

    if (!response.ok) {
      throw new Error(`Error obtaining token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Full API response:", data);

    if (data.success && data.uuid) {
      return data.uuid;
    } else {
      if (data.success === false && data.uuid === null) {
        throw new Error(
          "The email is not registered or is in an invalid format."
        );
      } else {
        throw new Error("Unexpected error while obtaining the token.");
      }
    }
  } catch (error) {
    console.error("Error in the token request:", error);
    alert(error.message);
    return null;
  }
}

////////////////////// API lista de doctores ///////////////////////////////////////
async function getDoctors(token) {
  const response = await fetch(`${apiBaseUrl}/listaDoctores`, {
    method: "GET",
    headers: {
      ordProyecto: projectKey,
      ordCandidato: token,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error obtaining the list of doctors: ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log("API Response:", data);
  if (!Array.isArray(data.list)) {
    console.error("Expected 'list' to be an array, but got:", data.list);
    return [];
  }

  return data.list;
}

// slider //
let currentIndex = 0;
let doctors = [];
const doctorsPerPage = 17;

function renderDoctors() {
  const doctorList = document.getElementById("doctor-list");
  doctorList.innerHTML = "";

  if (doctors.length > 0) {
    doctors.forEach((doctor) => {
      const doctorCard = document.createElement("div");
      doctorCard.className = "doctor-card";
      doctorCard.innerHTML = `
        <img src="${doctor.photo}" alt="${doctor.name}"/>
        <h4>${doctor.name}</h4>
        <p>${doctor.specialty}</p>
        <p>${doctor.university}</p>
        <a href="#register">Appointment</a>
      `;
      doctorList.appendChild(doctorCard);
    });
  }
}

(async function () {
  try {
    const email = "liamdiaz59@gmail.com";
    const token = await getToken(email);
    doctors = await getDoctors(token);

    if (doctors.length === 0) {
      console.warn("No doctors found.");
      return;
    }

    renderDoctors();
  } catch (error) {
    console.error("Error:", error);
  }
})();

(async function () {
  try {
    const email = "liamdiaz59@gmail.com";
    const token = await getToken(email);
    const doctors = await getDoctors(token);
    renderDoctors(doctors);
  } catch (error) {
    console.error("Error:", error);
  }
})();

//////////////////////////////// API Validación formulario //////////////////////////////////////////
let token = null;

async function initializeForm() {
  try {
    const email = "liamdiaz59@gmail.com";
    token = await getToken(email);
  } catch (error) {
    console.error("Error obtaining the token:", error);
    alert("There was a problem obtaining the token, please try again later.");
  }
}

initializeForm();

document
  .querySelector(".appointment-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!token) {
      alert("Unable to obtain the token. Please try again.");
      return;
    }

    const nombre = document.getElementById("name").value.trim();
    const telefono = document.getElementById("phone").value.trim();
    const fecha = document.getElementById("date").value.trim();
    const doctor = document.getElementById("doctor").value.trim();
    const mensaje = document.getElementById("message").value.trim();
    const privacyPolicy = document.getElementById("privacy-policy").checked;

    if (!nombre || !telefono || !fecha || !doctor || !privacyPolicy) {
      alert(
        "Please complete all required fields and accept the privacy policy."
      );
      return;
    }

    if (!/^\d{10}$/.test(telefono)) {
      alert("Please enter a valid phone number (10 digits).");
      return;
    }

    if (new Date(fecha) < new Date()) {
      alert("Please select a future date.");
      return;
    }

    if (!privacyPolicy) {
      alert("You must accept the privacy policy to continue.");
      return;
    }

    const body = {
      nombre,
      telefono,
      fecha,
      doctor,
      mensaje,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/mensaje`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ordProyecto: "a6093c23ae10457c8t0b8b298fc8b500",
          ordCandidato: token,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Appointment successfully scheduled!");

        document.getElementById("name").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("date").value = "";
        document.getElementById("doctor").value = "";
        document.getElementById("message").value = "";
        document.getElementById("privacy-policy").checked = false;
      } else {
        const error = await response.json();
        alert(
          "Error scheduling the appointment: " + (error.message || "Try again.")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "There was a problem processing your request. Please try again later."
      );
    }
  });

///////////////////////////////////// API Newsletter ////////////////////////////////////////////////////////////

async function subscribeToNewsletter(token, name, email) {
  try {
    const response = await fetch(`${apiBaseUrl}/newsletter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ordProyecto: projectKey,
        ordCandidato: token,
      },
      body: JSON.stringify({
        nombre: name,
        correo: email,
      }),
    });

    if (!response.ok) {
      throw new Error(`Subscription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    alert(`Error: ${error.message}`);
  }
}

document.getElementById("subscribe-btn").addEventListener("click", async () => {
  const name = document.getElementById("first-name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) {
    alert("Please enter both your name and email address.");
    return;
  }

  try {
    const token = await getToken(email);
    if (token) {
      await subscribeToNewsletter(token, name, email);
      alert("Subscription successful!");
      document.getElementById("first-name").value = "";
      document.getElementById("email").value = "";
    } else {
      alert("There was an issue with obtaining the token. Please try again.");
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

////////////// mneú hamburguesa /////////////////////////////////////
document.querySelector(".header_hamburger").addEventListener("click", () => {
  const menu = document.querySelector(".header_menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
});