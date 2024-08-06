export const DiagnosticService = {
    getDiagnosticsData() {
        return [
            {
                id: '1',
                doctorName: 'Dr. Smith',
                date: '2024-08-10',
                diagnosis: 'Flu',
                tests: 'Blood Test, X-Ray',
                notes: 'Patient should rest and drink plenty of fluids.'
            },
            {
                id: '2',
                doctorName: 'Dr. Brown',
                date: '2024-08-11',
                diagnosis: 'Diabetes',
                tests: 'Blood Sugar Test',
                notes: 'Monitor blood sugar levels daily.'
            },
            // Add more data as needed
        ];
    },

    getDiagnosticsMini() {
        return Promise.resolve(this.getDiagnosticsData().slice(0, 5));
    },

    getDiagnosticsSmall() {
        return Promise.resolve(this.getDiagnosticsData().slice(0, 10));
    },

    getDiagnostics() {
        return Promise.resolve(this.getDiagnosticsData());
    }
};
