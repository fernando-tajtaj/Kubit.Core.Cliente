using Kubit.Core.Cliente.Services;
using Kubit.Core.Cliente.Services.Seguridad;
using Kubit.Core.Modelo;
using Kubit.Core.Modelo.DTO;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Claims;

namespace Kubit.Core.Cliente.Pages.Autenticacion
{
    public class FirstLoginModel : PageModel
    {
        private readonly NavigationManager navigationManager;

        private readonly IUsuarioService usuarioService;

        [BindProperty(SupportsGet = false)]
        public string pUsuarioContraseniaActual { get; set; } = string.Empty;

        [BindProperty(SupportsGet = false)]
        public string pUsuarioContraseniaNueva { get; set; } = string.Empty;

        [BindProperty(SupportsGet = false)]
        public string pUsuarioContraseniaConfirmada { get; set; } = string.Empty;

        public FirstLoginModel(IUsuarioService pUsuarioService, NavigationManager pNavigationManager)
        {
            this.usuarioService = pUsuarioService;
            this.navigationManager = pNavigationManager;
        }

        public async Task<ActionResult> OnPostAsync()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.Sid);
            if (claim == null)
            {
                // Manejar el caso de que el claim no exista, por ejemplo:
                throw new Exception("Claim Sid no encontrado.");
            }

            string usuarioUuid = claim.Value;

            UsuarioDTO? usuario = await this.usuarioService.GetUsuarioByUuid(usuarioUuid);

            if (usuario == null)
            {
                TempData["Message"] = $"Usuario no encontrado.";
                return Page();
            }

            if (!usuario.UsuarioActivo)
            {
                TempData["Message"] = $"El usuario no está activo";
                return Page();
            }

            if (usuario.UsuarioBloqueadoHasta.HasValue && usuario.UsuarioBloqueadoHasta > DateTime.Now)
            {
                TempData["Message"] = $"El usuario está bloqueado hasta {usuario.UsuarioBloqueadoHasta.Value:g}.";
                return Page();
            }

            bool esHashValido = usuario.UsuarioContraseniaHash.StartsWith("$2a$")
                                || usuario.UsuarioContraseniaHash.StartsWith("$2b$")
                                || usuario.UsuarioContraseniaHash.StartsWith("$2y$");

            // Validar la contraseña actual, dependiendo si es hash o texto plano (primer login)
            bool contraseniaValida = false;

            if (usuario.UsuarioPrimerLogin && !esHashValido)
            {
                // Para primer login y contraseña sin hash, comparar texto plano
                contraseniaValida = (usuario.UsuarioContraseniaHash == pUsuarioContraseniaActual);
            }
            else
            {
                // Para usuarios con contraseña hasheada, verificar con BCrypt
                contraseniaValida = BCrypt.Net.BCrypt.Verify(pUsuarioContraseniaActual, usuario.UsuarioContraseniaHash);
            }

            if (!contraseniaValida)
            {
                usuario.UsuarioIntentosFallidos++;

                if (usuario.UsuarioIntentosFallidos >= 5)
                    usuario.UsuarioBloqueadoHasta = DateTime.Now.AddMinutes(10);

                await this.usuarioService.ActualizarUsuarioAsync(usuario);

                TempData["Message"] = "La contraseña actual es incorrecta.";
                return Page();
            }

            if (pUsuarioContraseniaActual == pUsuarioContraseniaNueva)
            {
                TempData["Message"] = "La contraseña actual no puede ser igual a la nueva.";
                return Page();
            }

            if (pUsuarioContraseniaNueva != pUsuarioContraseniaConfirmada)
            {
                TempData["Message"] = "Las contraseñas nuevas no coinciden.";
                return Page();
            }

            // Actualizar la contraseña con hash, resetear intentos y bloqueo, marcar que ya no es primer login
            usuario.UsuarioPrimerLogin = false;
            usuario.UsuarioContraseniaHash = BCrypt.Net.BCrypt.HashPassword(pUsuarioContraseniaNueva);
            usuario.UsuarioIntentosFallidos = 0;
            usuario.UsuarioBloqueadoHasta = null;
            usuario.UsuarioUltimoLogin = DateTime.Now;

            await this.usuarioService.ActualizarUsuarioAsync(usuario);

            TempData["Message"] = "Contraseña actualizada correctamente.";
            return RedirectToPage("/Index");
        }
    }
}
