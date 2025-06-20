using Kubit.Core.Cliente.Services.Sistema;
using Kubit.Core.Modelo.Extensions;
using Kubit.Core.Modelo.Templates;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kubit.Core.Cliente.Pages
{
    public class MainFormModel : PageModel
    {
        [BindProperty]
        public required Dictionary<string, string> ModeloValores { get; set; }

        public TablaModelo Modelo { get; set; } = new TablaModelo();

        private readonly IFormJsonService formJsonService;

        public MainFormModel(IFormJsonService pFormJsonService)
        {
            this.formJsonService = pFormJsonService;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var httpContext = this.HttpContext;

            if (httpContext == null)
            {
                return StatusCode(500, "HttpContext no disponible");
            }

            string programaUuid = httpContext.Session.GetString("ProgramaUuid") ?? string.Empty;
            string programaTablaPrimaria = httpContext.Session.GetString("ProgramaTablaPrimaria") ?? string.Empty;

            if (string.IsNullOrWhiteSpace(programaUuid) || string.IsNullOrWhiteSpace(programaTablaPrimaria))
            {
                return Page();
            }

            // Ya no es string, sino TablaModelo
            var tablaModelo = await this.formJsonService.GetTemplateAsync(programaTablaPrimaria)
                              ?? throw new InvalidOperationException("El template recibido es null.");

            this.Modelo = tablaModelo;

            return Page();
        }

        public IActionResult OnPost()
        {
            var httpContext = this.HttpContext;

            if (httpContext == null)
            {
                return new JsonResult(new { success = false, message = "HttpContext no disponible" }) { StatusCode = 500 };
            }

            string programaTablaPrimaria = httpContext.Session.GetString("ProgramaTablaPrimaria") ?? string.Empty;

            var insertModel = new TablaModeloValores
            {
                Tabla = programaTablaPrimaria,
                Valores = this.ModeloValores
            };

            string sqlSentence = insertModel.ToInsertSql();

            if (!ModelState.IsValid)
            {
                return new JsonResult(new { success = false, message = "Formulario inválido" });
            }

            // Aquí podrías guardar en base de datos
            return new JsonResult(new { success = true, message = "Registro guardado exitosamente" });
        }
    }
}
