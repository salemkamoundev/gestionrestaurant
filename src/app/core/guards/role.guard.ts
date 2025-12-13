import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, tap } from 'rxjs/operators';
import { UserRole } from '../models/interfaces';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Récupérer les rôles autorisés depuis la route (data: { roles: ['admin', ...] })
  const expectedRoles: UserRole[] = route.data['roles'] || [];

  return authService.user$.pipe(
    take(1), // On prend juste la valeur actuelle
    map(user => {
      // 1. L'utilisateur doit être connecté
      if (!user) {
        return false;
      }

      // 2. Si aucun rôle n'est spécifié dans la route, accès autorisé par défaut aux users connectés
      if (expectedRoles.length === 0) {
        return true;
      }

      // 3. Vérifier si le rôle de l'utilisateur est dans la liste autorisée
      const hasRole = expectedRoles.includes(user.role);
      return hasRole;
    }),
    tap(isAuthorized => {
      if (!isAuthorized) {
        // Redirection si non autorisé (soit login, soit page 403/Dashboard)
        console.warn('⛔ Accès refusé par RoleGuard');
        router.navigate(['/login']); 
      }
    })
  );
};
