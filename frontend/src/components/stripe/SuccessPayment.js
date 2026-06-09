import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const SuccessPayment = () => {
    const [searchParams] = useSearchParams();
    const idInscriere = searchParams.get("id_inscriere");
    const [status, setStatus] = useState("Se procesează plata...");
    const requestTrimis = useRef(false); // Previne dubla-apelare


    useEffect(() => {
        // Aici am putea face un update in backend ca status_plata = PLATIT
       const confirmaPlataInBackend = async () => {
                   if (idInscriere && !requestTrimis.current) {
                       requestTrimis.current = true;
                       try {
                       //extrage tokenul
                        const token = localStorage.getItem('token');

                        //trimitere token-ul in configurarea Axios
                           await axios.put(`http://localhost:8080/plati/plata-reusita/${idInscriere}`,{},{
                                  headers:{
                                    Authorization: `Bearer ${token}`
                                  }
                           });


                           setStatus("Plata a fost confirmată și înregistrată cu succes!");
                       } catch (error) {
                           console.error("Eroare la actualizarea plății:", error);
                           setStatus("Plata a reușit, dar actualizarea în sistem a eșuat. Contactează suportul.");
                       }
                   }
               };

               confirmaPlataInBackend();
    }, [idInscriere]);

    return (
        <div className="container mt-5 text-center">
            <h2 className="text-success">✅ {status}</h2>
            <p>Îți mulțumim! Inscrierea ta merge acum către coordonator pentru validare.</p>
            <Link to="/istoric" className="btn btn-primary mt-3">Vezi Înscrierile Mele</Link>
        </div>
    );
};
export default SuccessPayment;