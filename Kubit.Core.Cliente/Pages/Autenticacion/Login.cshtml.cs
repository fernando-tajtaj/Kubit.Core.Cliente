using Kubit.Core.Cliente.Services;
using Kubit.Core.Cliente.Services.Seguridad;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Claims;

namespace Kubit.Core.Cliente.Pages.Autenticacion
{
    public class LoginModel : PageModel
    {
        private readonly NavigationManager navigationManager;

        private readonly IUsuarioService usuarioService;
        private readonly IEmpresaService empresaService;

        [BindProperty(SupportsGet = false)]
        public string UsuarioCorreo { get; set; } = string.Empty;

        [BindProperty(SupportsGet = false)]
        public string UsuarioContrasenia { get; set; } = string.Empty;

        [BindProperty(SupportsGet = false)]
        public string UuidEmpresa { get; set; } = string.Empty;

        public LoginModel(IUsuarioService pUsuarioService, IEmpresaService pEmpresaService, NavigationManager pNavigationManager)
        {
            this.usuarioService = pUsuarioService;
            this.empresaService = pEmpresaService;
            this.navigationManager = pNavigationManager;
        }

        public async Task<IActionResult> OnPostAsync()
        {
            var usuario = await this.usuarioService.LogInAsync(UsuarioCorreo, UsuarioContrasenia, UuidEmpresa);

            if (usuario == null)
            {
                TempData["Message"] = "Credenciales inválidas";
                return Page();
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Sid, usuario.UsuarioUuid),
                new Claim(ClaimTypes.Name, $"{usuario.UsuarioNombre} {usuario.UsuarioApellido}"),
                new Claim(ClaimTypes.Email, usuario.UsuarioCorreo),
                new Claim(ClaimTypes.GroupSid, usuario.UsuarioEmpresaUuid)                
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            this.HttpContext.Session.SetString("UsuarioUuid", usuario.UsuarioUuid);
            this.HttpContext.Session.SetString("EmpresaUuid", usuario.EmpresaUuid);
            this.HttpContext.Session.SetString("EmpresaDesc", usuario.EmpresaNombre);

            return RedirectToPage(usuario.UsuarioPrimerLogin
                ? "/Autenticacion/FirstLogin"
                : "/Index");
        }

        public async Task<IActionResult> OnPostLogoutAsync()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToPage("/Autenticacion/Login");
        }

        public async Task<IActionResult> OnGetEmpresasAsync(string pUsuarioCorreo)
        {
            if (string.IsNullOrEmpty(pUsuarioCorreo))
                return BadRequest("El correo es obligatorio");

            try
            {
                var empresas = await this.empresaService.GetEmpresasUsuarioAsync(pUsuarioCorreo);

                if (empresas == null || !empresas.Any())
                    return NotFound();

                return new JsonResult(empresas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        public void OnGet()
        {
        }
    }
}
