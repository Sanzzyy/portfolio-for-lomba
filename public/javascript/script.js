const hamburgerMenu = document.querySelector("#hamburger-menu");
const navItems = document.querySelector("#nav-items");

hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("ri-close-large-fill");
  navItems.classList.toggle("left-full");
  navItems.classList.toggle("left-0");
});

// Nav Active
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    if (pageYOffset >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Gsap Animation Typing Text
const labelP = document.querySelector(".label-p");
const cursor = document.querySelector(".cursor");
const texts = ["Frontend Developer", "Content Creator"];
const typingTarget = document.querySelector(".typing-text");

let textIndex = 0;

function typeText(text, onComplete) {
  typingTarget.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      typingTarget.textContent += text[i];
      i++;
      setTimeout(type, 100);
    } else {
      setTimeout(() => onComplete(), 2000); // Tahan 2 detik sebelum hapus
    }
  }

  type();
}

function deleteText(onComplete) {
  let text = typingTarget.textContent;
  let i = text.length;

  function erase() {
    if (i > 0) {
      typingTarget.textContent = text.slice(0, i - 1);
      i--;
      setTimeout(erase, 50);
    } else {
      onComplete();
    }
  }

  erase();
}

function loop() {
  typeText(texts[textIndex], () => {
    deleteText(() => {
      textIndex = (textIndex + 1) % texts.length;
      loop();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loop();
});

// Program Supabase
document.getElementById("openModal").addEventListener("click", () => {
  messageModal.classList.remove("hidden");
});

const supabaseUrl = "https://grovlgfgkqlruafhcxth.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyb3ZsZ2Zna3FscnVhZmhjeHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTU5MjgsImV4cCI6MjA2NzAzMTkyOH0.4JLhof3bQ9EyDS9wRG5Zfz1GrjEedp2ll-7chjjHFqw"; // Ganti pakai anon key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const messageModal = document.getElementById("messageModal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const messageForm = document.getElementById("messageForm");
const messageContainer = document.getElementById("messageContainer");
const mainTance = document.getElementById("maintance");

// Ambil elemen form
const formMaintance = document.querySelector("#form-maintance");

openModal.addEventListener("click", () => {
  messageModal.classList.remove("hidden");
});

// Event buka modal
document.getElementById("openModal").addEventListener("click", (e) => {
  e.preventDefault(); // optional, karena button tidak submit
  messageModal.classList.remove("hidden");
});

// Tutup modal
closeModal.addEventListener("click", () => {
  messageModal.classList.add("hidden");
});

// Submit form
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fullname = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const position = document.getElementById("position").value;
  const message = document.getElementById("message").value;

  const { error } = await supabaseClient.from("messages").insert([{ fullname, email, position, message }]);

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Fail",
      text: error.message,
    });
  } else {
    Swal.fire({
      icon: "success",
      title: "Message Sent!",
      text: "Thank you for your feedback. 🙌",
      showConfirmButton: false,
      timer: 2000,
    });

    messageForm.reset();
    messageModal.classList.add("hidden");
    loadMessages(); // ambil ulang pesan terbaru
  }
});

async function loadMessages() {
  const { data, error } = await supabaseClient.from("messages").select("*").order("created_at", { ascending: false });
  if (error) return;

  messageContainer.innerHTML = "";
  data.forEach((msg) => {
    const initials = msg.fullname
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    messageContainer.innerHTML += `
      <div class="border-2 border-slate-800 p-5 rounded-lg bg-slate-800 text-white" >
        <div><i class="ri-double-quotes-l font-bold text-3xl"></i></div>
        <h1 class="font-bold font-lexend">${msg.message}</h1>
        <div class="py-2" style="color: #eab308">
          <i class="ri-star-s-fill text-yellow-500"></i>
          <i class="ri-star-s-fill text-yellow-500"></i>
          <i class="ri-star-s-fill text-yellow-500"></i>
          <i class="ri-star-s-fill text-yellow-500"></i>
          <i class="ri-star-s-fill text-yellow-500"></i>
        </div>
        <div class="flex items-center gap-3">
          <div class="border-2 border-white w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center rounded-full font-bold font-junga" style="width: 3.5rem;height: 3.5rem;
">${initials}</div>
          <div class="flex flex-col">
            <h3 class="text-sm sm:text-base md:text-lg font-bold font-comfortaa">${msg.fullname}</h3>
            <p class="text-xs sm:text-sm md:text-base font-lexend text-[#8f8f8fee]">${msg.position}</p>
          </div>
        </div>
      </div>`;
  });
}

loadMessages();
