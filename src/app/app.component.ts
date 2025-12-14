import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false, // <--- AJOUT CRUCIAL ICI
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Salem Kamoun - Portfolio';
  isMenuOpen = false;

  profile = {
    name: 'Salem Kamoun',
    location: 'Kerkennah Islands - Sfax - Tunisia',
    phone: '+216 28 606 748',
    email: 'kammoun.salem@gmail.com',
    linkedin: 'https://www.linkedin.com/in/salem-kamoun',
    summary: `Développeur expert avec 15 ans d'expérience, spécialisé en développement web et mobile (Ionic, Android & iOS, Angular Firebase) et en automatisation intelligente via n8n. Je transforme vos idées en applications mobiles performantes et j'optimise vos processus en créant des agents IA sur mesure. Mon expertise web complète me permet de livrer des solutions digitales innovantes et efficaces.`,
    skills: [
      'Angular', 'Firebase', 'Ionic', 'Node.js', 'TypeScript', 
      'JavaScript', 'n8n', 'PHP', 'VBScript', 'MySQL', 'HTML/CSS', 
      'Android/iOS', 'Automatisation IA', 'Responsive Design'
    ],
    languages: [
      { name: 'Français', level: 'Native or Bilingual Proficiency' },
      { name: 'Arabe', level: 'Native or Bilingual Proficiency' },
      { name: 'Anglais', level: 'Limited Working Proficiency' }
    ],
    education: [
      {
        institution: 'Institut Supérieur des Sciences Appliquées et de Technologie de Sousse - ISSAT Sousse',
        degree: 'Diplôme Universitaire de Technologie (DUT) en Informatique',
        period: 'Septembre 2004 - Juillet 2008',
        description: 'Formation complète en développement web et bases de données.'
      }
    ],
    experiences: [
      {
        company: 'Freelance | Self-Employed',
        role: 'Développeur Fullstack JS (Angular, Node.js, Firebase)',
        period: 'Juin 2025 - Présent (5 mois)',
        location: 'Kerkennah, Gouvernorat de Sfax, Tunisie',
        description: `Développement d'applications web et mobiles avec Angular, Ionic, Firebase. Intégration d'automatisation IA via n8n pour analyse de données patients. UI responsive et mobile-friendly avec Angular Material et Bootstrap. Exemple : https://passonbuddy-b6f53.web.app/landing`
      },
      {
        company: 'passOnBuddy',
        role: 'Owner/Worker @ passOnBuddy.com',
        period: 'Janvier 2022 - Février 2023 (1 an 2 mois)',
        location: 'Tunisie',
        description: `Plateforme de mise en relation professionnelle : "N'embauchez plus d'inconnu !" Connexion LinkedIn-freelancer.com pour publication rapide de tâches. Développement fullstack avec JavaScript et bases de données.`
      },
      {
        company: 'Refer',
        role: 'Développeur FullStack JS',
        period: 'Juin 2020 - Décembre 2021 (1 an 7 mois)',
        location: 'Tunisie',
        description: `Application mobile iOS/Android pour élargir le réseau LinkedIn. Technologies : JavaScript, TypeScript, Firebase, Ionic, Figma pour UI/UX.`
      },
      {
        company: 'Tedemis',
        role: 'Spécialiste en Développement Web',
        period: 'Février 2011 - Août 2016 (5 ans 7 mois)',
        location: 'Paris, France & Tunisie (à distance)',
        description: `Développement de jeux concours pour Carrefour, Vogue, Disneyland Paris. Stack : PHP, MySQL, HTML/CSS, Zend Framework, méthodologie SCRUM.`
      },
      {
        company: 'Proxym-IT',
        role: 'Développeur Web',
        period: 'Septembre 2009 - Novembre 2010 (1 an 3 mois)',
        location: 'Sousse, Tunisie',
        description: `Applications web avec JavaScript (jQuery, ExtJS), PHP5, CakePHP, MySQL.`
      },
      {
        company: 'MINISIS Inc.',
        role: 'Développeur Front-end (VBS, HTML, JavaScript)',
        period: 'Octobre 2008 - Mai 2009 (8 mois)',
        location: 'Tunis, Tunisie',
        description: `Interfaces utilisateur avec VBS, HTML, JavaScript, Microsoft SQL Server.`
      }
    ]
  };

  constructor() {}

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onNavClick(targetHash: string): void {
    this.closeMenu();
    const targetId = targetHash.substring(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    if (link && (link.getAttribute('href') || '').includes('#') && !link.href.includes('linkedin')) {
      event.preventDefault();
      const href = link.getAttribute('href') || '';
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      this.closeMenu();
    }
  }
}
