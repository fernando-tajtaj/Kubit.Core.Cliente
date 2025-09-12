using Kubit.Core.Cliente.Handlers;
using Kubit.Core.Cliente.Services.Ejecucion;
using Kubit.Core.Cliente.Services.Sistema;
using Kubit.Core.Modelo.Response;
using Kubit.Core.Modelo.Templates;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kubit.Core.Cliente.Pages
{
    public class MainFormModel : PageModel
    {
        public required string Directorio { get; set; }
        public Modelo.Templates.Modelo Modelo { get; set; } = new();
        [BindProperty] public Valores Valores { get; set; } = new();
        [BindProperty] public List<SubValores> SubValores { get; set; } = new();

        private readonly IFormJsonService formJsonService;
        private readonly IEjecucionService ejecucionService;
        private readonly ConsultaHandler consultaHandler;
        private readonly SqlHandler sqlHandler;

        public MainFormModel(IFormJsonService pFormJsonService, IEjecucionService pEjecucionService, ConsultaHandler pConsultaHandler, SqlHandler pSqlHandler)
        {
            this.formJsonService = pFormJsonService;
            this.ejecucionService = pEjecucionService;
            this.consultaHandler = pConsultaHandler;
            this.sqlHandler = pSqlHandler;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var httpContext = this.HttpContext;

            if (httpContext == null)
            {
                return StatusCode(500, "HttpContext no disponible");
            }

            this.Directorio = httpContext.Session.GetString("Directorio") ?? string.Empty;

            string empresaUuid = httpContext.Session.GetString("EmpresaUuid") ?? string.Empty;
            string programaUuid = httpContext.Session.GetString("ProgramaUuid") ?? string.Empty;
            string programaTablaPrimaria = httpContext.Session.GetString("ProgramaTablaPrimaria") ?? string.Empty;

            if (string.IsNullOrWhiteSpace(programaUuid) || string.IsNullOrWhiteSpace(programaTablaPrimaria))
            {
                return Page();
            }

            string accion = this.HttpContext.Session.GetString("Accion") ?? string.Empty;

            // Ya no es string, sino TablaModelo
            var modelo = await this.formJsonService.GetTemplateAsync(programaTablaPrimaria, empresaUuid, accion);

            if (modelo == null)
            {
                return Page();
            }

            this.Modelo = modelo;

            return Page();
        }

        public async Task<IActionResult> OnGetConsultaDatosAsync(string pParamConsultaUuid, string pParamParents)
        {
            var httpContext = this.HttpContext;

            if (httpContext == null)
            {
                return StatusCode(500, "HttpContext no disponible");
            }

            try
            {
                string programaUuid = httpContext.Session.GetString("ProgramaUuid") ?? string.Empty;

                var resultado = await this.consultaHandler.GetDatosJsonAsync(pParamConsultaUuid, programaUuid);

                return new JsonResult(resultado);
            }
            catch (Exception)
            {
                return new JsonResult(new
                {
                    success = false,
                    message = "Error al obtener datos de búsqueda."
                })
                { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> OnPostAsync()
        {
            try
            {
                string sqlModeloBuild = this.sqlHandler.BuildSqlModel(1, this.Valores);

                string sqlSubModelBuild = this.sqlHandler.BuildSqlSubModel(this.SubValores);

                if (string.IsNullOrEmpty(sqlModeloBuild))
                {
                    return Page();
                }

                string sqlTotal = string.Join(Environment.NewLine, sqlModeloBuild, sqlSubModelBuild);

                var response = await this.ejecucionService.EjecutarNonQueryAsync(sqlTotal);

                return new JsonResult(new
                {
                    success = response.Success,
                    message = response.Success ? "Registro guardado exitosamente" : response.Message
                });
            }
            catch (Exception ex)
            {
                return new JsonResult(new
                {
                    success = false,
                    message = "Error inesperado",
                    detalle = ex.Message
                });
            }
        }

        public IActionResult OnPostRedirectToGridAsync()
        {
            var directorioActual = HttpContext.Session.GetString("Directorio") ?? string.Empty;

            // Quitar " / Agregar" al final si existe
            var nuevoDirectorio = directorioActual.EndsWith(" / Agregar")
                ? directorioActual.Substring(0, directorioActual.Length - " / Agregar".Length)
                : directorioActual;

            HttpContext.Session.SetString("Directorio", nuevoDirectorio);

            return RedirectToPage("MainGrid");
        }
    }
}
