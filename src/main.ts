import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

(BigInt.prototype as any).toJSON = function () {
  return this.toString(); // Converte o BigInt em String (ex: "123")
  // Ou use: return Number(this); se o backend esperar um número puro
};
