"use client"
import { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function Rv() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date: '',
    time: '',
  });

  const toast = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/reserver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Votre rendez-vous est enregistré', life: 3000 });
        } else {
          toast.current.show({ severity: 'warn', summary: 'Avertissement', detail: result.message, life: 3000 });
        }
      } else {
        toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'patient n exsite pas ', life: 3000 });
      }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur de création du rendez-vous', life: 3000 });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-white h-115 lg:h-115 dark:bg-boxdark">
      <Toast ref={toast} />
      <form onSubmit={handleSubmit} className="flex flex-col w-full lg:w-1/2">
        <div className="mt-4 ml-6">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">Nom</label>
          <input
            className="w-full lg:w-80 rounded border border-gray-300 px-4 py-2 text-black outline-none transition focus:border-primary"
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
          />
        </div>
        <div className="mt-4 ml-6">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white ">Prénom</label>
          <input
            className="w-full lg:w-80 rounded border border-gray-300 px-4 py-2 text-black outline-none transition focus:border-primary"
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
          />
        </div>
        <div className="mt-4 ml-6">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">Date Rendez-vous</label>
          <input
            className="w-full lg:w-80 rounded border border-gray-300 px-4 py-2 text-black outline-none transition focus:border-primary"
            type="text"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        <div className="mt-4 ml-6">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">Heure Rendez-vous</label>
          <input
            className="w-full lg:w-80 rounded border border-gray-300 px-4 py-2 text-black outline-none transition focus:border-primary"
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>
        <button className="mt-5 w-25 ml-20 lg:ml-6 lg:mr-5 bg-primary px-6 py-2 text-white font-medium rounded hover:bg-opacity-90">
          Réserver
        </button>
      </form>
      <img className="w-full lg:w-1/2 h-auto mt-5 lg:mt-0 ml-auto lg:ml-10" src="/rv.png" alt="Document Image" />
    </div>
  );
}

export default Rv;
