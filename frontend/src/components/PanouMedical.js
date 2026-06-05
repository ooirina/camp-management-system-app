import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PanouMedical(){
   const [pacienti, setPacienti]=useState([]);
   const [tabere, setTabere] = useState([]);
   const [loading,setLoading]=useState(true);
   // Starea pentru filtrul de tabără
 // Pre-selectează tabăra activă dacă există în memorie, altfel folosește 'TOATE'
  const [filtruTabara, setFiltruTabara] = useState(localStorage.getItem('tabaraActivaId') || 'TOATE');

   //luare id-ul cooordonatorului din memorie(sayu unde s-a salvat la login)
   const idCoordonator =localStorage.getItem('userId');

   // 1. Aducem lista de tabere pentru dropdown
     useEffect(() => {

         // Dacă nu găsim ID-ul, oprim loading-ul imediat ca să nu se blocheze ecranul!
             if (!idCoordonator) {
               setLoading(false);
               return;
             }
       if (idCoordonator) {
         axios.get(`http://localhost:8080/tabere/coordonator/${idCoordonator}`)
           .then(res => setTabere(res.data))
           .catch(err => console.error("Eroare la aducerea taberelor:", err));
       }
     }, [idCoordonator]);

// 2. Aducem pacienții (se re-apelează automat când se schimbă filtrul)
  useEffect(() => {
    if (idCoordonator) {
      setLoading(true);
      // Decidem ce rută apelăm în funcție de dropdown
      const url = filtruTabara === 'TOATE'
        ? `http://localhost:8080/participanti/medical/${idCoordonator}`
        : `http://localhost:8080/participanti/medical/${idCoordonator}/tabara/${filtruTabara}`;

      axios.get(url)
        .then(res => {
          setPacienti(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Eroare la preluarea datelor medicale:", err);
          setLoading(false);
        });
    }
  }, [idCoordonator, filtruTabara]);

  if (!loading && !idCoordonator) {
        return <div className="text-center mt-5 text-danger fw-bold">Eroare: Nu s-a putut identifica ID-ul coordonatorului (userId lipsește din sesiune).</div>;
    }

return (
<div className="container mt-4 mb-5 print-container">
      <div className="d-flex justify-content-between align-items-end mb-3 d-print-none">

        {/* Dropdown dinamic */}
        <div style={{ width: '300px' }}>
          <label className="form-label fw-bold text-muted small mb-1">Filtrează după Tabără:</label>
          <select
            className="form-select border-danger-subtle shadow-sm"
            value={filtruTabara}
            onChange={(e) => setFiltruTabara(e.target.value)}
          >
            <option value="TOATE">Toate taberele mele</option>
            {tabere.map(tabara => (
              <option key={tabara.id} value={tabara.id}>
                {tabara.nume}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-danger shadow-sm fw-bold" onClick={() => window.print()}>
          🖨️ Printează Lista A4
        </button>
      </div>

      <div className="card shadow-lg border-danger border-top border-4">
        <div className="card-header bg-white p-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="text-danger fw-bold mb-0">🚑 Panou Situații Medicale</h2>
            <p className="text-muted mb-0 mt-1 d-print-none">Afișează doar participanții care necesită atenție specială.</p>
          </div>
          <div className="fs-1 d-print-none">⚕️</div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Nume Participant</th>
                  <th>Vârstă (Gen)</th>
                  <th>Alergii (Atenție masă!)</th>
                  <th>Probleme Medicale</th>
                  <th className="px-4 d-print-none">Contact Urgență</th>
                </tr>
              </thead>
              <tbody>
                {pacienti.length > 0 ? (
                  pacienti.map((p) => {
                    const anNastere = new Date(p.dataNasterii).getFullYear();
                    const varsta = new Date().getFullYear() - anNastere;

                    return (
                      <tr key={p.id}>
                        <td className="px-4 fw-bold">{p.nume} {p.prenume}</td>
                        <td>{varsta} ani ({p.gen})</td>
                        <td>
                          {p.alergii ? <span className="badge bg-danger fs-6 text-wrap text-start" style={{maxWidth: '200px'}}>⚠️ {p.alergii}</span> : <span className="text-muted">-</span>}
                        </td>
                        <td>
                          {p.problemeMedicale ? <span className="badge bg-warning text-dark fs-6 text-wrap text-start" style={{maxWidth: '200px'}}>🩺 {p.problemeMedicale}</span> : <span className="text-muted">-</span>}
                        </td>
                        <td className="px-4 d-print-none">
                          <a href={`tel:${p.contactUrgenta}`} className="btn btn-sm btn-outline-danger fw-bold">📞 {p.contactUrgenta}</a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-success fw-bold">✅ Niciun participant nu a raportat probleme medicale.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanouMedical;