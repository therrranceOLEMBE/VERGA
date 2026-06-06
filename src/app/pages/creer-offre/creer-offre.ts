import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

type OfferPricingType = 'kilo' | 'container' | 'metreCube';

@Component({
  selector: 'app-creer-offre',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './creer-offre.html',
  styleUrl: './creer-offre.css',
})
export class CreerOffre {
  protected title = '';
  protected offerType: OfferPricingType | '' = '';
  protected transportType = '';
  protected description = '';
  protected pricePerKg = '';
  protected availableKg = '';
  protected containerPrice = '';
  protected pricePerCubicMeter = '';
  protected availableCubicMeters = '';
  protected departureCountry = '';
  protected destinationCountry = '';
  protected departureDate = '';
  protected arrivalDate = '';

  protected readonly offerTypeOptions = [
    { value: '', labelKey: 'backoffice.createOffer.selectOfferType' },
    { value: 'kilo', labelKey: 'backoffice.createOffer.offerTypeKilo' },
    { value: 'container', labelKey: 'backoffice.createOffer.offerTypeContainer' },
    { value: 'metreCube', labelKey: 'backoffice.createOffer.offerTypeCubicMeter' },
  ];

  protected readonly transportTypeOptions = [
    { value: '', labelKey: 'backoffice.createOffer.selectTransportType' },
    { value: 'aerien', labelKey: 'backoffice.createOffer.transportAerial' },
    { value: 'maritime', labelKey: 'backoffice.createOffer.transportMaritime' },
    { value: 'terrestre', labelKey: 'backoffice.createOffer.transportTerrestrial' },
  ];

  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
