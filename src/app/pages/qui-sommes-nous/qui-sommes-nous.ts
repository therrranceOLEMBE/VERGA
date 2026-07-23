import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ValueItem {
  index: string;
  titleKey: string;
  descKey: string;
}

interface MissionPoint {
  textKey: string;
}

@Component({
  selector: 'app-qui-sommes-nous',
  imports: [Header, Footer, TranslatePipe, RouterLink],
  templateUrl: './qui-sommes-nous.html',
  styleUrl: './qui-sommes-nous.css',
})
export class QuiSommesNous {
  protected readonly values: ValueItem[] = [
    { index: '01', titleKey: 'about.value1.title', descKey: 'about.value1.text' },
    { index: '02', titleKey: 'about.value2.title', descKey: 'about.value2.text' },
    { index: '03', titleKey: 'about.value3.title', descKey: 'about.value3.text' },
  ];

  protected readonly missionPoints: MissionPoint[] = [
    { textKey: 'about.mission1' },
    { textKey: 'about.mission2' },
    { textKey: 'about.mission3' },
  ];
}
