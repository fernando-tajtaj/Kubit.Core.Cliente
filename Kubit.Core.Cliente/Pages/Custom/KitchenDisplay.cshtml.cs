using Kubit.Core.Cliente.Handlers;
using Kubit.Core.Cliente.Services.Consulta;
using Kubit.Core.Cliente.Services.Sistema;
using Kubit.Core.Modelo.Schemas.Consulta;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Kubit.Core.Cliente.Pages.Custom
{
    public class KitchenDisplayModel : PageModel
    {
        [BindProperty] public string ProgramaUuid { get; set; } = string.Empty;
        [BindProperty] public string Directorio { get; set; } = string.Empty;
        public Fn_ParamConsulta_Vista_Json Fn_ParamConsulta_Vista_Json { get; private set; } = new();
        public string Table { get; set; } = string.Empty;

        private readonly IProgramaService programaService;
        private readonly IParamConsultaService paramConsultaService;
        private readonly ConsultaHandler consultaHandler;

        public KitchenDisplayModel(IProgramaService programaService, IParamConsultaService pParamConsultaService, ConsultaHandler pConsultaHandler)
        {
            this.programaService = programaService;
            this.paramConsultaService = pParamConsultaService;
            this.consultaHandler = pConsultaHandler;
        }
        public async Task OnGetAsync()
        {
            this.SetSessionProgramaUuid();
            await this.SetSessionProgramaTablaPrimaria();

            var vistaJson = await this.consultaHandler.GetVistaJsonAsync(this.ProgramaUuid);

            if (vistaJson != null)
            {
                this.Fn_ParamConsulta_Vista_Json = vistaJson;
            }

            this.HttpContext.Session.SetString("Directorio", this.Directorio);
        }

        private void SetSessionProgramaUuid()
        {
            if (!string.IsNullOrEmpty(this.ProgramaUuid))
            {
                this.HttpContext.Session.SetString("ProgramaUuid", this.ProgramaUuid);
            }
            else
            {
                this.ProgramaUuid = this.HttpContext.Session.GetString("ProgramaUuid") ?? string.Empty;
            }
        }

        private async Task SetSessionProgramaTablaPrimaria()
        {
            var programa = await programaService.GetProgramaUuidAsync(ProgramaUuid);

            if (programa != null && !string.IsNullOrEmpty(programa.ProgramaTablaPrimaria))
            {
                this.HttpContext.Session.SetString("ProgramaTablaPrimaria", programa.ProgramaTablaPrimaria);
            }
        }

        public async Task<IActionResult> OnPostAsync()
        {
            this.SetSessionProgramaUuid();
            await this.SetSessionProgramaTablaPrimaria();

            var vistaJson = await this.consultaHandler.GetVistaJsonAsync(this.ProgramaUuid);

            if (vistaJson != null)
            {
                this.Fn_ParamConsulta_Vista_Json = vistaJson;
            }

            this.HttpContext.Session.SetString("Directorio", this.Directorio);

            return this.Page();
        }

        public IActionResult OnPostRedirectToForm()
        {
            this.HttpContext.Session.SetString("Accion", "A");

            var directorioActual = this.HttpContext.Session.GetString("Directorio") ?? string.Empty;
            var nuevoDirectorio = string.IsNullOrEmpty(directorioActual)
                ? "Agregar"
                : $"{directorioActual} / Agregar";

            this.HttpContext.Session.SetString("Directorio", nuevoDirectorio);

            return this.RedirectToPage("../MainForm");
        }
    }
}
