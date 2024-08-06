
// Modify ProductService to return rendezvous data
export const RendezvousService = {
    getRendezvousData() {
        return [
            {
                id: '1',
                dateRendezVous: '10-08-2024',
                timeRendezVous: '10:00',
                nomPatient: 'Doe',
                prenomPatient: 'John',
                etat: 'Confirmed'
            },
            {
                id: '2',
                dateRendezVous: '11-08-2024',
                timeRendezVous: '16:30',
                nomPatient: 'Smith',
                prenomPatient: 'Jane',
                etat: 'Pending'
            },
            // Add more data as needed
        ];
    },

    getRendezvousMini() {
        return Promise.resolve(this.getRendezvousData().slice(0, 5));
    },

    getRendezvousSmall() {
        return Promise.resolve(this.getRendezvousData().slice(0, 10));
    },

    getRendezvous() {
        return Promise.resolve(this.getRendezvousData());
    }
};

               
