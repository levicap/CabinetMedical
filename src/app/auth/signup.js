"use client"
import { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';  // Import the PrimeReact theme
import 'primereact/resources/primereact.min.css';          // Import PrimeReact CSS
import 'primeicons/primeicons.css';   
import './style.css'                     // Import PrimeIcons

const SignupForm = () => {
  const [formData, setFormData] = useState({
    telephone: '',
    email: '',
    password: '',
    role: 'patient',
    image: '/uploads/rv.png'
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
      const response = await fetch('/api/newpatient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'User created successfully!', life: 3000 });
      } else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to create user.', life: 3000 });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to create user.', life: 3000 });
    }
  };
 

  return (
    <div >
     
        <Toast ref={toast} className=" top-90 right-90 " />
      
      <form onSubmit={handleSubmit} className="sign-up-form">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telephone">
            Telephone:
          </label>
          <input
            type="text"
            name="telephone"
            id="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password:
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button type="submit" className="w-24 bg-dk text-white py-2 rounded-lg hover:bg-dk">
          Sign Up
        </button>
        
      </form>
    </div>
  );
};

export default SignupForm;
