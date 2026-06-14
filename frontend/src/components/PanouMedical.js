import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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

   //pentru centralizaere bucatarie preparate speciale
   const [raport, setRaport] = useState(null);

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


//generare logica raport bucatarie
  const  generateKitchenReport =async()=>{
       if(filtruTabara ===' TOATE')
       {
           toast.warn("Te rugăm să selectezi o tabără specifică pentru a genera raportul!", {
                           position: "top-right",
                           autoClose: 3000,
                           hideProgressBar: false,
                           closeOnClick: true,
                           pauseOnHover: true,
                           draggable: true
                       });
                       return;
       }
      try {
         const response= await axios.get(`http://localhost:8080/participanti/raport-bucatarie/${filtruTabara}`);
         setRaport(response.data);

         toast.success("Raportul logistic a fost generat cu succes!");
      }catch (error){
        console.error("Eroare la generare raport:", error);
        toast.error("Eroare la generarea raportului. Încearcă din nou.");

      }
  };


  if (!loading && !idCoordonator) {
        return <div className="text-center mt-5 text-danger fw-bold">Eroare: Nu s-a putut identifica ID-ul coordonatorului (userId lipsește din sesiune).</div>;
    }

return (
<div className="container-fluid px-4 py-4" style={{ background: '#F8F9FB', minHeight: '100vh' }}>

    {/* ── Toolbar ── */}
    <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
      <div className="d-flex align-items-center gap-2">
        <label className="mb-0 text-secondary" style={{ fontSize: '13px', fontWeight: 500 }}>Tabără:</label>
        <select
          className="form-select form-select-sm shadow-none"
          style={{ width: '210px', borderColor: '#D0D5DD', borderRadius: '8px', fontSize: '13px' }}
          value={filtruTabara}
          onChange={(e) => setFiltruTabara(e.target.value)}
        >
          <option value="TOATE">Toate taberele mele</option>
          {tabere.map(tabara => (
            <option key={tabara.id} value={tabara.id}>{tabara.nume}</option>
          ))}
        </select>
      </div>

      <div className="d-flex gap-2">
        <button
          className="btn btn-sm d-flex align-items-center gap-2"
          style={{ borderRadius: '8px', border: '1px solid #D0D5DD', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#344054', padding: '6px 14px' }}
          onClick={generateKitchenReport}
        >
          📋 Raport Bucătărie
        </button>
        <button
          className="btn btn-sm d-flex align-items-center gap-2"
          style={{ borderRadius: '8px', background: '#16A34A', border: 'none', fontSize: '13px', fontWeight: 500, color: '#fff', padding: '6px 14px' }}
          onClick={() => window.print()}
        >
          🖨️ Printează Lista
        </button>
      </div>
    </div>

    {/* ── Raport Bucătărie ── */}
    {raport && (
      <div className="card border-0 shadow-sm mb-4 d-print-none" style={{ borderRadius: '12px' }}>
        <div className="card-header border-0 d-flex align-items-center gap-2" style={{ background: '#EFF6FF', borderRadius: '12px 12px 0 0', padding: '14px 20px' }}>
          <span style={{ color: '#2563EB', fontWeight: 600, fontSize: '14px' }}>📋 Sumar Logistică Bucătărie</span>
        </div>
        <div className="card-body" style={{ padding: '20px' }}>
          <div className="mb-1" style={{ fontSize: '28px', fontWeight: 700, color: '#101828' }}>
            {raport["Total Porții"]}
          </div>
          <div className="mb-3" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#98A2B3', fontWeight: 600 }}>
            total porții necesare
          </div>
          <div className="d-flex flex-wrap gap-2">
            {Object.entries(raport)
              .filter(([key]) => key !== "Total Porții")
              .map(([alergie, numar]) => (
                <span key={alergie} style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: 500, color: '#D97706' }}>
                  {numar}× fără {alergie}
                </span>
              ))}
          </div>
        </div>
      </div>
    )}

    {/* ── Tabel principal ── */}
    <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>

      {/* Card header */}
      <div className="card-header border-0 d-flex justify-content-between align-items-center" style={{ background: '#fff', padding: '18px 24px', borderBottom: '1px solid #E4E7EC' }}>
        <div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#101828' }}>Situații Medicale</span>
            <span style={{ background: '#DCFCE7', color: '#16A34A', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>
              {pacienti.length} participanți
            </span>
          </div>
          <p className="mb-0 d-print-none" style={{ fontSize: '13px', color: '#98A2B3', marginTop: '2px' }}>
            Afișează doar participanții care necesită atenție specială.
          </p>
        </div>
        <span style={{ fontSize: '22px' }} className="d-print-none">⚕️</span>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table mb-0 align-middle" style={{ fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8F9FB' }}>
              <th className="px-4" style={{ fontSize: '11px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid #E4E7EC' }}>Nume Participant</th>
              <th style={{ fontSize: '11px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid #E4E7EC' }}>Vârstă / Gen</th>
              <th style={{ fontSize: '11px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid #E4E7EC' }}>Alergii</th>
              <th style={{ fontSize: '11px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid #E4E7EC' }}>Probleme Medicale</th>
              <th className="d-print-none" style={{ fontSize: '11px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', borderBottom: '1px solid #E4E7EC' }}>Contact Urgență</th>
            </tr>
          </thead>
          <tbody>
            {pacienti.length > 0 ? (
              pacienti.map((p) => {
                const anNastere = new Date(p.dataNasterii).getFullYear();
                const varsta = new Date().getFullYear() - anNastere;
                const initiale = `${(p.prenume||'')[0]||''}${(p.nume||'')[0]||''}`.toUpperCase();

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F2F4F7' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                          {initiale}
                        </div>
                        <span style={{ fontWeight: 600, color: '#101828' }}>{p.nume} {p.prenume}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#344054' }}>
                      {varsta} ani
                      <span style={{ background: '#F2F4F7', border: '1px solid #E4E7EC', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, color: '#475467', marginLeft: '6px' }}>
                        {p.gen}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.alergii
                        ? <span style={{ background: '#FEE2E2', color: '#DC2626', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>⚠ {p.alergii}</span>
                        : <span style={{ color: '#98A2B3' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.problemeMedicale
                        ? <span style={{ background: '#FEF3C7', color: '#D97706', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>🩺 {p.problemeMedicale}</span>
                        : <span style={{ color: '#98A2B3' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }} className="d-print-none">
                      <a href={`tel:${p.contactUrgenta}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', border: '1px solid #E4E7EC', background: '#fff', color: '#344054', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}>
                        📞 {p.contactUrgenta}
                      </a>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                  <div style={{ fontWeight: 600, color: '#101828', fontSize: '15px', marginBottom: '4px' }}>Nicio situație medicală raportată</div>
                  <div style={{ color: '#98A2B3', fontSize: '13px' }}>Toți participanții din această tabără sunt în regulă.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}

export default PanouMedical;
