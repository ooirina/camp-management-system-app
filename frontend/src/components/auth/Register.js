// Un formular simplu care trimite un POST către /utilizatori/creare
const [user, setUser] = useState({
    nume: '',
    email: '',
    parola: '',
    rol: 'PARENT' // Default pentru cine se înregistrează singur
});

const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/utilizatori/creare', user);
    alert("Cont creat cu succes!");
};