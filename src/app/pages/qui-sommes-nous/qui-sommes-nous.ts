import { Component } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ValueCard {
  titleKey: string;
  descKey: string;
  icon: 'innovation' | 'engagement' | 'confiance';
}

interface MissionPoint {
  textKey: string;
}

@Component({
  selector: 'app-qui-sommes-nous',
  imports: [Header, Footer, TranslatePipe],
  templateUrl: './qui-sommes-nous.html',
  styleUrl: './qui-sommes-nous.css',
})
export class QuiSommesNous {
  protected readonly values: ValueCard[] = [
    { titleKey: 'about.value1.title', descKey: 'about.value1.text', icon: 'innovation' },
    { titleKey: 'about.value2.title', descKey: 'about.value2.text', icon: 'engagement' },
    { titleKey: 'about.value3.title', descKey: 'about.value3.text', icon: 'confiance' },
  ];

  protected readonly missionPoints: MissionPoint[] = [
    { textKey: 'about.mission1' },
    { textKey: 'about.mission2' },
    { textKey: 'about.mission3' },
  ];
}
