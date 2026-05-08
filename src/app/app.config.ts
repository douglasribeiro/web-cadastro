import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter, withEnabledBlockingInitialNavigation } from "@angular/router";
import { routes } from "./app.routes";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { APP_INITIALIZER } from '@angular/core';
import { KeycloakBearerInterceptor, KeycloakService } from 'keycloak-angular';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
  config: {
    url: 'http://localhost:8080',
    realm: 'meu-realm',
    clientId: 'angular-client'
  },
  //initOptions: {
  //  onLoad: 'check-sso', // Mude para check-sso para o app carregar antes
  //  silentCheckSsoRedirectUri: undefined,
  //  checkLoginIframe: false,
  //  responseMode: 'query'
  //},
  initOptions: {
  onLoad: 'login-required', // Redireciona para o login se não estiver autenticado
  checkLoginIframe: false,
  responseMode: 'query'
},
  // ISSO É CRÍTICO NO ANGULAR 19
  shouldAddToken: (request) => {
    const { method, url } = request;
    // Não adicione token em chamadas para o próprio Keycloak ou assets
    //return true //!url.includes('/protocol/openid-connect/') && !url.includes('/assets/');
    return request.url.includes('localhost:8081');
  },
  enableBearerInterceptor: true,
  bearerPrefix: 'Bearer',
  bearerExcludedUrls: ['/assets'],
});
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    KeycloakService,
    // ADICIONE ESTA LINHA ABAIXO:
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    }
]
};
/*
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    provideHttpClient(),
    KeycloakService
  ]
};
*/
