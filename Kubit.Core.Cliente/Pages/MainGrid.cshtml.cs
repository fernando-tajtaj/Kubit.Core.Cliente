using Kubit.Core.Cliente.Handlers;
using Kubit.Core.Cliente.Services.Consulta;
using Kubit.Core.Cliente.Services.Sistema;
using Kubit.Core.Modelo.Schemas.Consulta;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text;

namespace Kubit.Core.Cliente.Pages
{
    [Authorize]
    public class MainGridModel : PageModel
    {
        [BindProperty] public string ProgramaUuid { get; set; } = string.Empty;
        [BindProperty] public string Directorio { get; set; } = string.Empty;
        public Fn_ParamConsulta_Vista_Json Fn_ParamConsulta_Vista_Json { get; private set; } = new();
        public string Table { get; set; } = string.Empty;

        private readonly IProgramaService programaService;
        private readonly IParamConsultaService paramConsultaService;
        private readonly ConsultaHandler consultaHandler;

        public MainGridModel(IProgramaService programaService, IParamConsultaService pParamConsultaService, ConsultaHandler pConsultaHandler)
        {
            this.programaService = programaService;
            this.paramConsultaService = pParamConsultaService;
            this.consultaHandler = pConsultaHandler;
        }
        public async Task OnGetAsync()
        {
            this.SetSessionProgramaUuid();
            this.SetSessionProgramaTablaPrimaria();

            var vistaJson = await this.consultaHandler.GetVistaJsonAsync(this.ProgramaUuid);

            if (vistaJson != null)
            {
                this.Fn_ParamConsulta_Vista_Json = vistaJson;
            }

            HttpContext.Session.SetString("Directorio", this.Directorio);
        }

        public async Task<IActionResult> OnPostAsync()
        {
            this.SetSessionProgramaUuid();
            this.SetSessionProgramaTablaPrimaria();

            var vistaJson = await this.consultaHandler.GetVistaJsonAsync(this.ProgramaUuid);

            if (vistaJson != null)
            {
                this.Fn_ParamConsulta_Vista_Json = vistaJson;
            }

            this.HttpContext.Session.SetString("Directorio", this.Directorio);

            return Page();
        }

        // === Métodos privados de procesamiento ===
        private void SetSessionProgramaUuid()
        {
            if (!string.IsNullOrEmpty(ProgramaUuid))
            {
                HttpContext.Session.SetString("ProgramaUuid", ProgramaUuid);
            }
            else
            {
                ProgramaUuid = HttpContext.Session.GetString("ProgramaUuid") ?? string.Empty;
            }
        }

        private void SetSessionProgramaTablaPrimaria()
        {
            var programa = programaService.GetProgramaUuidAsync(ProgramaUuid).Result;

            if (programa != null && !string.IsNullOrEmpty(programa.ProgramaTablaPrimaria))
            {
                HttpContext.Session.SetString("ProgramaTablaPrimaria", programa.ProgramaTablaPrimaria);
            }
        }

        public IActionResult OnPostRedirectToForm()
        {
            this.HttpContext.Session.SetString("Accion", "A");

            var directorioActual = HttpContext.Session.GetString("Directorio") ?? string.Empty;
            var nuevoDirectorio = string.IsNullOrEmpty(directorioActual)
                ? "Agregar"
                : $"{directorioActual} / Agregar";

            HttpContext.Session.SetString("Directorio", nuevoDirectorio);

            return RedirectToPage("MainForm");
        }
    }
}