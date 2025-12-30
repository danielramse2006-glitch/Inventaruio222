import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyCtIagFFJBFRjvg5usXTm575YqOeeDE1G0",
    authDomain: "mi-inventario-51f82.firebaseapp.com",
    projectId: "mi-inventario-51f82",
    storageBucket: "mi-inventario-51f82.firebasestorage.app",
    appId: "1:79417755416:web:e1bbab46cda2bdbb5da56d"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let currentBase64 = "";

window.nav = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
};

// --- AUTO-RELLENAR AL BUSCAR (Imagen 1000088439.jpg) ---
window.buscarYAutoRellenar = async () => {
    const mod = document.getElementById('f-search').value;
    const q = query(collection(db, "productos"), where("modelo", "==", mod));
    const snap = await getDocs(q);
    if(!snap.empty) {
        const d = snap.docs[0].data();
        document.getElementById('f-modelo').value = d.modelo || "";
        document.getElementById('f-parte').value = d.parte || "";
        document.getElementById('f-nombre').value = d.nombre || "";
        document.getElementById('f-desc').value = d.desc || "";
        document.getElementById('f-cant').value = d.cantidad || "";
        document.getElementById('f-costo').value = d.costo || "";
        document.getElementById('f-area').value = d.area || "";
        document.getElementById('f-obs').value = d.obs || "";
        alert("Objeto cargado.");
    } else { alert("No encontrado."); }
};

// --- GUARDAR / ACTUALIZAR ---
document.getElementById('btnPrincipal').onclick = async () => {
    const p = document.getElementById('f-parte').value;
    const datos = {
        modelo: document.getElementById('f-modelo').value,
        parte: p,
        nombre: document.getElementById('f-nombre').value,
        cantidad: Number(document.getElementById('f-cant').value),
        area: document.getElementById('f-area').value,
        img: currentBase64
    };
    const q = query(collection(db, "productos"), where("parte", "==", p));
    const snap = await getDocs(q);
    if(!snap.empty) {
        await updateDoc(doc(db, "productos", snap.docs[0].id), datos);
    } else {
        const all = await getDocs(collection(db, "productos"));
        await addDoc(collection(db, "productos"), { idNum: all.size + 1, ...datos });
    }
    alert("Realizado.");
    nav('sec-home');
};

// --- CÓDIGO DE BARRAS REAL (Imagen 1000088440.jpg) ---
window.generarPrevisualizacion = () => {
    const val = document.getElementById('bar-input').value;
    if(!val) return;
    JsBarcode("#barcode-svg", val, { format: "CODE128", width: 2, height: 80 });
    document.getElementById('bar-list-items').innerHTML += `<div>${val}</div>`;
};

window.imprimirPDF = () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.text("SISTEMA REYNOSA - ETIQUETAS", 10, 10);
    pdf.save("etiquetas.pdf");
};

// --- RENDERIZADO TABLA PRINCIPAL ---
onSnapshot(collection(db, "productos"), s => {
    const tb = document.getElementById('tbody-home'); tb.innerHTML = "";
    s.docs.forEach(d => {
        const p = d.data();
        tb.innerHTML += `<tr>
            <td>${p.idNum || ''}</td><td>${p.modelo}</td><td>${p.nombre}</td><td>${p.parte}</td>
            <td>${p.desc || ''}</td><td>${p.costo || ''}</td><td>${p.cantidad}</td><td>${p.area}</td>
            <td><img src="${p.img || ''}" width="30"></td>
        </tr>`;
    });
});
