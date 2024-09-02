"use client";
import { signIn, useSession } from "next-auth/react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Google from "./google"

export default function SignIn() {
  const [error, setError] = useState('');
  const router = useRouter(); // Use Next.js router for redirection
  const { data: session } = useSession(); // Access session data

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const result = await signIn("credentials", {
      redirect: false, // Prevent automatic redirection
      email,
      password,
    });

    if (result.ok) {
      // Wait for session to be updated
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      
      // Redirect based on user role
      if (sessionData?.user) {
        const { role } = sessionData.user;
        switch (role) {
          case 'admin':
            router.push('/');
            break;
          case 'patient':
            router.push('/informations');
            break;
          case 'medecin':
            router.push('/dossier');
            break;
          case 'secretaire':
            router.push('/rendezvous');
            break;
          default:
            router.push('/');
        }
      }
    } else {
      // Set error message
      setError(result.error || "Failed to sign in");
    }
  };

  return (
    <div >
      <form onSubmit={handleSubmit} className="sign-in-form">
      <label                       className="block text-gray-700 text-sm font-bold mb-2"
      >
        Email:
        <input name="email" type="email" required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
 />
      </label>
      <label                       className="block text-gray-700 text-sm font-bold mb-2 ml-5"
      > 
        Password:
        <input name="password" type="password" required className="w-full ml-5 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
      </label>
      <button type="submit" className="w-24 bg-dk text-white py-2 rounded-lg hover:bg-dk"
      >Sign In</button>
      {error && <p>{error}</p>}
    </form>
    <Google />
    </div>
  );
}
