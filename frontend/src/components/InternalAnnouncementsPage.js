import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const InternalAnnouncementsPage=()=>{

    const[announcements, setAnnouncements] = useState([]);
    const[newMessage, setNewMessage] =useState('');
    const[isMainCoordinator, setIsMainCoordinator] =useState(false);
    const [loading, setLoading] =useState(true);
    const [activeCampName, setActiveCampName]= useState('');


    const activeCampId = localStorage.getItem('tabaraActivaId');
    const currentUserId= localStorage.getItem('userId');
    const currentUserEmail =localStorage.getItem('userEmail');


    useEffect(()=>{

        if(!activeCampId){
           setLoading(false);
           return;
        }

        const fetchData =async()=>{
           try{

               const campResponse =await axios.get('http://localhost:8080/tabere/lista');
               const currentCamp =campResponse.data.find(camp=>camp.id.toString() === activeCampId.toString());

               if(currentCamp){
                   setActiveCampName(currentCamp.nume);

                   if(currentCamp.idCoordonatorPrincipal?.toString() === currentUserId?.toString()){
                         setIsMainCoordinator(true);

                   }

               }

               const announcementsResponse= await axios.get(`http://localhost:8080/anunturi-interne/tabara/${activeCampId}`);
               setAnnouncements(announcementsResponse.data);

               //Logica pentru Bulina Rosie
               if(announcementsResponse.data.length>0){
               const latestId = announcementsResponse.data[0].id;
                localStorage.setItem('lastSeenAnnouncementId', latestId.toString());

               }

           }catch(error){

             console.error("Error fetching announcements data:", error);
             toast.error("Eroare la încărcarea avizierului intern.");
           } finally {
              setLoading(false);
           }
        };

         fetchData();
    }, [activeCampId, currentUserId]);

    const handlePostAnnouncement =async (e)=> {
         e.preventDefault();
         if (!newMessage.trim())
         return;


      const payload={
          idTabara: parseInt(activeCampId),
          mesaj:newMessage,
          idAutor:parseInt(currentUserId)

      };

      try{
          const response= await axios.post('http://localhost:8080/anunturi-interne/salveaza', payload);
          //Adaugare mesaj nou la inceputl listei fara reincarcarea paginei
          setAnnouncements([response.data, ...announcements]);
          setNewMessage('');//curatare textarea
          toast.success("Anunțul a fost postat către echipă!");


      }catch (error)
      {
         console.error("Error posting the announcement:", error);
         toast.error("A apărut o eroare la publicarea mesajului.");

        }
      };


      const formatDate=(dateString)=>{
         if(!dateString)
            return '';
            const options={day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString('ro-RO', options);
      };
         if (!activeCampId) {
             return (
                 <div className="container mt-5 text-center">
                     <h3 className="text-danger mb-4">⚠️ Nu ai selectat nicio tabără!</h3>
                     <p className="text-muted">Pentru a vedea avizierul intern, trebuie să declari în ce tabără te afli.</p>
                     <Link to="/coordonator-profile" className="btn btn-success fw-bold mt-3">
                         Mergi la Profil pentru selecție
                     </Link>
                 </div>
             );
         }


return (
        <div className="container mt-5 mb-5" style={{ maxWidth: '800px' }}>
            <div className="text-center mb-4">
                <h2 className="fw-bold text-dark">📋 Avizier Staff: {activeCampName}</h2>
                <p className="text-muted">
                    Acesta este canalul oficial de comunicare internă.
                    {isMainCoordinator ? " Ai drepturi de Șef Tabără." : " (Mod Citire)"}
                </p>
            </div>

            {/* ZONA DE POSTARE (Apare DOAR dacă este coordonator principal al taberei) */}
            {isMainCoordinator && (
                <div className="card shadow-sm border-success mb-5">
                    <div className="card-header bg-success text-white py-3">
                        <h5 className="mb-0 fw-bold"><i className="bi bi-megaphone me-2"></i> Adaugă un Anunț Nou</h5>
                    </div>
                    <div className="card-body bg-light">
                        <form onSubmit={handlePostAnnouncement}>
                            <div className="form-group mb-3">
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Ex: Întâlnirea de la ora 14:00 se mută în sala de mese din cauza ploii..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <div className="text-end">
                                <button type="submit" className="btn btn-dark fw-bold px-4">
                                    Trimite Echipei
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LISTA DE ANUNȚURI (Avizierul) */}
            <div>
                <h4 className="fw-bold mb-3 border-bottom pb-2">Ultimele Anunțuri</h4>

                {loading ? (
                    <div className="text-center my-4">
                        <div className="spinner-border text-success" role="status"></div>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="alert alert-secondary text-center py-4">
                        Niciun anunț momentan. Echipa este la curent cu totul!
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {announcements.map((ann) => (
                            <div key={ann.id} className="card border-0 shadow-sm" style={{ borderLeft: '5px solid #0f5132' }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                                        <span className="fw-bold text-success">
                                            <i className="bi bi-person-badge me-2"></i>
                                            {ann.autor?.email}
                                        </span>
                                        <span className="small text-muted text-uppercase fw-semibold">
                                            <i className="bi bi-clock me-1"></i>
                                            {formatDate(ann.dataPostare)}
                                        </span>
                                    </div>
                                    <p className="card-text mb-1 text-dark" style={{ whiteSpace: 'pre-line' }}>
                                        {ann.mesaj}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InternalAnnouncementsPage;