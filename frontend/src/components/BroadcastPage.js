import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const BroadcastPage=()=> {

     const quillRef=useRef(null);
     const editorRef= useRef(null);

   //setari pentru formulare
   const [tabere, setTabere] = useState([]);
       const [selectedTabara, setSelectedTabara] = useState(localStorage.getItem('tabaraActivaId') || '');
       const [broadcastSubiect, setBroadcastSubiect] = useState('');
       const [broadcastMesaj, setBroadcastMesaj] = useState('');
       const [isSendingMail, setIsSendingMail] = useState(false);

     ///cand se deschide pagina, se ia lista din bd
       useEffect(()=>{
         // 1. Luăm direct ID-ul coordonatorului din localStorage
                 const userId = localStorage.getItem('userId');

                 const fetchTabereCoordonator = async () => {
                     if (!userId) return;

                     try {
                         // 2. Apelăm ruta ta directă din TabaraController!
                         const response = await axios.get(`http://localhost:8080/tabere/coordonator/${userId}`);

                         // 3. Punem direct taberele în state, fără filtrări complicate
                         setTabere(response.data);

                     } catch (error) {
                         console.error("Eroare la preluarea taberelor coordonatorului:", error);
                     }
                 };

          //logica de initializare a editorului Quill
          if(quillRef.current && !editorRef.current){
              editorRef.current = new Quill(quillRef.current,{
                  theme:'snow',
                  modules:{
                      toolbar:[
                            [{'header':[1,2,false]}],
                            ['bold','italic', 'underline'],
                            [{'list':'ordered'},{'list': 'bullet'}],
                            ['link']
                      ]
                  }

              });
            ///Actualizare stare boradcastMesaj cand se scrie ceva
            editorRef.current.on('text-change', ()=>{
                setBroadcastMesaj(editorRef.current.root.innerHTML);

            });
          }
          //functia ce preia taberele
              fetchTabereCoordonator();

       },[]);///array gol asigura ca ruleaza o singura data la montare


       const handleSendBroadcast =async(e) =>{
           e.preventDefault();
           if(!selectedTabara){
              alert("Te rugăm să selectezi o tabără din listă!");
              return;

           }

        setIsSendingMail(true);
        try{
           const response=await axios.post(`http://localhost:8080/broadcast/trimite/${selectedTabara}`,{
              subiect: broadcastSubiect,
              mesaj:broadcastMesaj

           });

           if(response.data.status ==="success"){

              alert(response.data.message);
              setBroadcastSubiect('');
             // Resetăm manual și editorul vizual
             if (editorRef.current) {
                  editorRef.current.setText('');
                  }

        }else {
           alert(` ${response.data.message}`);
        }
       } catch (error) {
                     console.error("Eroare la trimiterea broadcast-ului:", error);
                     alert("A apărut o eroare de rețea.");
             } finally {
                     setIsSendingMail(false);
                     }
};

return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <div className="d-flex shadow-lg rounded-3 overflow-hidden mx-auto" style={{ maxWidth: '1200px', backgroundColor: '#fff' }}>

                {/* SIDEBAR-UL VERDE ÎNCHIS */}
                <div className="d-flex flex-column p-3 text-white" style={{ width: '240px', backgroundColor: '#0f5132' }}>
                    <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-success mt-2">
                        <i className="bi bi-clouds-fill me-2 fs-4 text-warning"></i>
                        <span className="fs-5 fw-bold tracking-wide text-uppercase">CampCore</span>
                    </div>

                    <ul className="nav nav-pills flex-column mb-auto gap-1 small">
                        <li>
                            <a href="#" className="nav-link text-white active bg-success fw-bold ps-2">
                                <i className="bi bi-envelope-at me-2"></i> Communication
                            </a>
                        </li>
                        <li>
                            <a href="/check-in-out" className="nav-link text-white opacity-75 ps-2">
                                <i className="bi bi-qr-code-scan me-2"></i> Inapoi la Check-in
                            </a>
                        </li>
                    </ul>
                </div>

                {/* ZONA PRINCIPALĂ DE EDITARE */}
                <div className="flex-grow-1 p-5 d-flex flex-column">
                    <div className="mb-4 pb-3 border-bottom">
                        <h3 className="fw-bold mb-1 text-dark">Create Broadcast Message</h3>
                        <p className="text-muted mb-0">Trimite anunțuri către toți părinții confirmați dintr-o tabără.</p>
                    </div>

                    <form onSubmit={handleSendBroadcast} className="d-flex flex-column flex-grow-1">

                        {/* 0. SELECTARE TABĂRĂ */}
                        <div className="mb-4">
                            <label className="form-label text-secondary fw-bold small text-uppercase mb-1">Selectează Tabăra Țintă</label>
                            <select
                                className="form-select bg-light border-1"
                                value={selectedTabara}
                                onChange={(e) => setSelectedTabara(e.target.value)}
                                required
                            >
                                <option value="">-- Alege Tabăra --</option>
                                {tabere.map((tabara) => (
                                    <option key={tabara.id} value={tabara.id}>{tabara.nume}</option>
                                ))}
                            </select>
                        </div>

                        {/* 1. EMAIL SUBJECT */}
                        <div className="mb-4">
                            <label className="form-label text-secondary fw-bold small text-uppercase mb-1">Email Subject</label>
                            <input
                                type="text"
                                className="form-control bg-light"
                                placeholder="ex: Informații plecare..."
                                value={broadcastSubiect}
                                onChange={(e) => setBroadcastSubiect(e.target.value)}
                                style={{ fontSize: '1.05rem' }}
                                required
                            />
                        </div>

                        {/* 2. EMAIL MESSAGE EDITOR */}
                        <div className="mb-4 d-flex flex-column flex-grow-1">
                              <label className="form-label text-secondary fw-bold small text-uppercase mb-1">Mesaj Email</label>

                                      <div className="bg-white" style={{ height: '300px', marginBottom: '40px' }}>
                                             <div ref={quillRef} style={{ height: '100%', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />
                                      </div>
                        </div>

                        {/* BUTON DE TRIMITERE */}
                        <div className="d-flex justify-content-end mt-auto pt-3 border-top">
                            <button type="submit" className="btn btn-dark px-5 fw-bold shadow-sm" disabled={isSendingMail} style={{ backgroundColor: '#1a252f' }}>
                                {isSendingMail ? '⏳ Se trimite...' : 'Trimite Email-uri'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default BroadcastPage;