"use client";
import React, { useState } from 'react';

function Generate() {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [critere, setCritere] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/rapport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateDebut,
          dateFin,
          critere,
        }),
      });
    

      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rapport.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="bg-white w-125">
      <h1 className="mt-5 ml-5 font-medium text-2xl text-black">Generation Rapport</h1>
      <form onSubmit={handleSubmit}>
        <div className="mt-4.5 ml-6.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">Date debut</label>
          <input
            type="text"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary"
          />
        </div>
        <div className="mt-4.5 ml-6.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">Date Fin</label>
          <input
            type="text"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="w-80 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary"
          />
        </div>
        <div className="mt-4.5 ml-6.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">Choisir critère</label>
          <select
            value={critere}
            onChange={(e) => setCritere(e.target.value)}
            className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
          >
            <option value="Patients">Patients</option>
            <option value="Rendez-vous">Rendez vous</option>
            <option value="Consultation">Consultation</option>
          </select>
        </div>
        <button type="submit" className="bg-primary w-24 h-10 text-white rounded-lg ml-96 mb-2.5">
          Download
        </button>
      </form>
    </div>
  );
}

export default Generate;
