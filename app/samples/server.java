public class Server {
	private int maxClients;
	private int anzahlClients;
	private boolean sicherungswunsch;

	public Server(int maxClients) {
		this.maxClients = maxClients;
		this.anzahlClients = 0;
		this.sicherungswunsch = false;
	}

	public synchronized void daten_ablegen(Client c) throws InterruptedException {

		System.out.println("Client " + c.ID + " will Daten ablegen");

		while (this.anzahlClients > maxClients) {
			wait();
		}
		/*
		 * Kritischen Bereich 1 
		 * wechselseitige Ausschluss--> 
		 * Mutual Exclusion
		 * (Zum jeden Zeitpunkt darf sich hoehstens ein Prozess in kritischen Bereichen befinden.)
		 *Das Resource in kritischen Bereich 1 ist anzahlClients.
		 */
		this.anzahlClients++;
		System.out.println(anzahlClients + " Clients legen Daten ab.");
	}

	public synchronized void daten_ablegen_beenden() {
		try {
			
			this.anzahlClients--;
			notifyAll();
		} catch (IllegalMonitorStateException ims) {
			ims.printStackTrace();
		}
	}
	
	/*
	 * Kritischen Bereich 2
	 * wechselseitige Ausschluss--> 
	 * Mutual Exclusion
	 * (Zum jeden Zeitpunkt darf sich hoehstens ein Prozess in kritischen Bereichen befinden.)
	 * Das Resource in kritischen Bereich 2 ist sicherungswunsch.
	 */
	public synchronized void sicherungAktivieren() throws InterruptedException {
		System.out.println("Sicherungswunsch angemeldet!");

		while (this.anzahlClients > 0) {
			wait();
		}
		
		this.sicherungswunsch = true;
		// Zum Sichern bereit.
	}

	public synchronized void sicherungDeaktivieren() {
		try {
			this.sicherungswunsch = false;
			System.out.println("Sicherungswunsch deaktiviert.");
			notifyAll();
		} catch (IllegalMonitorStateException ims) {
			ims.printStackTrace();
		}

	}
}
