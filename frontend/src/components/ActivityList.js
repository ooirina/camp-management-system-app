import React ,{useState,useEffect} from 'react';
import {ActivityService} from '../services/api.js';
import { Link } from 'react-router-dom';

const ActivityList=()=>{

const [activities,setActivities]=useState([]);
const [loading, setLoading]=useState(true);
const [error,setError]=useState(null);
useEffect(()=>{
const fetchActivities=async()=> {
  try{
  const response= await ActivityService.getAll();
  setActivities(response.data);
  setLoading(false);
 }
 catch(err){
 setError('Eroare la incarcare activitati!');
 setLoading(false);

 }
};
fetchActivities();
},[]);

const handleDelete= async(id)=>{
if(window.confirm("Sigur vrei sa stergi aceasta activitate?"))
 {
   try {
   await ActivityService.delete(id);
   setActivities(activities.filter(activity=>activity.id!==id));
      }
      catch(err){
      alert("Nu s-a putut sterge activitatea!");
      }

}};


if (loading)
return <div className="text-center mt-5">Se incarca activitatile</div>;
if(error)
return<div className="alert alert-danger">{error}</div>;

return(
 <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Lista Activitati</h2>
                <Link to="/tabere/new" className="btn btn-success">
                    Adaugă Activitate Nouă
                </Link>
            </div>

            <table className="table table-hover shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nume</th>
                        <th>Data</th>
                        <th>Descriere</th>
                        <th>Ora Inceput</th>
                        <th>Ora Sfarsit</th>
                        <th>Locatie</th>
                        <th>Capacitate Maxima</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="text-center">Nu există tabere înregistrate.</td>
                        </tr>
                    ) : (
                        activities.map(activitate => (
                            <tr key={activitate.id}>
                                <td>{activitate.id}</td>
                                <td>{activitate.nume}</td>
                                <td>{activitate.data}</td>
                                <td>{activitate.descriere}</td>
                                <td>{activitate.oraInceput}</td>
                                <td>{activitate.oraSfarsit}</td>
                                <td>{activitate.locatie}</td>
                                <td>{activitate.capacitateMax}</td>
                                <td>
                                    <Link to={`/activitati/${activitate.id}`} className="btn btn-sm btn-info me-2">Detalii</Link>
                                    <button onClick={() => handleDelete(activitate.id)} className="btn btn-sm btn-danger">Șterge</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ActivityList;