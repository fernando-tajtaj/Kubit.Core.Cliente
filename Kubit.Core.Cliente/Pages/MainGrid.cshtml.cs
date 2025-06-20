using Kubit.Core.Cliente.Services.Busqueda;
using Kubit.Core.Cliente.Services.Sistema;
using Kubit.Core.Modelo;
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
        [BindProperty] public string? Directorio { get; set; }
        public string? MenuPadre { get; private set; }
        public string? MenuHijo { get; private set; }
        public List<Dictionary<string, object>> Datos { get; private set; } = new();

        private readonly IProgramaService programaService;
        private readonly IParamBusquedaService paramBusquedaService;

        public MainGridModel(IProgramaService programaService, IParamBusquedaService paramBusquedaService)
        {
            this.programaService = programaService;
            this.paramBusquedaService = paramBusquedaService;
        }

        public void OnPost()
        {
            this.SetSessionProgramaUuid();
            this.SetSessionProgramaTablaPrimaria();
            this.CrearDirectorio();
            this.Datos = this.ExecuteSelectAsync(ProgramaUuid, 1).Result;
        }

        // === Métodos privados de procesamiento ===

        private void SetSessionProgramaUuid()
        {
            if (!string.IsNullOrEmpty(ProgramaUuid))
            {
                HttpContext.Session.SetString("ProgramaUuid", ProgramaUuid);
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

        private void CrearDirectorio()
        {
            if (!string.IsNullOrEmpty(Directorio))
            {
                var partes = Directorio.Split(';');
                MenuPadre = partes.Length > 0 ? partes[0].Trim() : null;
                MenuHijo = partes.Length > 1 ? partes[1].Trim() : null;
            }
            else
            {
                MenuPadre = null;
                MenuHijo = null;
            }
        }

        // === Lógica de búsqueda dinámica ===
        public async Task<List<Dictionary<string, object>>> ExecuteSelectAsync(string pUuidPrograma, short pOrigen)
        {
            if (string.IsNullOrEmpty(pUuidPrograma))
                return new List<Dictionary<string, object>>();

            try
            {
                var paramBusqueda = await paramBusquedaService.GetParamBusquedaAsync(pUuidPrograma, pOrigen);
                if (paramBusqueda == null)
                    return new List<Dictionary<string, object>>();

                var paramBusquedaDetSql = await paramBusquedaService.GetParamBusquedaDetAsync(paramBusqueda.Uuid);
                var paramBusquedaWhere = await paramBusquedaService.GetParamBusquedaWhereAsync(paramBusqueda.Uuid, pUuidPrograma);

                string sql = BuildSql(paramBusqueda.Tabla, paramBusqueda.Vista, paramBusquedaDetSql, paramBusquedaWhere);
                var resultado = await paramBusquedaService.ExecuteSelectAsync(sql);

                return resultado ?? new List<Dictionary<string, object>>();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error obteniendo consulta dinámica", ex);
            }
        }

        // === Generador de SQL dinámico ===
        private string BuildSql(string tabla, string vista, ParamBusquedaDetSql detalles, List<ParamBusquedaWhere>? condiciones)
        {
            var sql = new StringBuilder();
            var sqlWhere = new StringBuilder();

            if (condiciones is { Count: > 0 })
            {
                sqlWhere.Append(" WHERE ");
                bool esPrimera = true;

                foreach (var cond in condiciones.OrderBy(w => w.Orden))
                {
                    var fragmento = new StringBuilder();

                    if (cond.Grupo > 0)
                        fragmento.Append("(");

                    if (cond.Operador.Equals("BETWEEN", StringComparison.OrdinalIgnoreCase) &&
                        !string.IsNullOrWhiteSpace(cond.CampoDatoDesde) &&
                        !string.IsNullOrWhiteSpace(cond.CampoDatoHasta))
                    {
                        fragmento.Append($"{cond.CampoOrigen} BETWEEN '{cond.CampoDatoDesde}' AND '{cond.CampoDatoHasta}'");
                    }
                    else
                    {
                        fragmento.Append($"{cond.CampoOrigen} {cond.Operador} ");
                        if (!string.IsNullOrWhiteSpace(cond.CampoWhere))
                        {
                            switch (cond.Tipo)
                            {
                                case 1: // Claim
                                    string valor = User?.FindFirst(cond.CampoWhere)?.Value ?? string.Empty;
                                    fragmento.Append($"'{valor}'");
                                    break;
                            }
                        }
                    }

                    if (cond.Grupo > 0)
                        fragmento.Append(")");

                    if (!esPrimera)
                        sqlWhere.Append(" ").Append(cond.Condicion?.ToUpper() ?? "AND").Append(" ");

                    sqlWhere.Append(fragmento);
                    esPrimera = false;
                }
            }

            string fuente = !string.IsNullOrEmpty(vista) ? vista : tabla;
            if (string.IsNullOrEmpty(fuente))
                throw new ArgumentException("Debe especificar al menos una tabla o vista para la consulta dinámica.");

            sql.Append($"SELECT {detalles.SqlColumns} FROM {fuente}");

            if (sqlWhere.Length > 0)
                sql.Append(" ").Append(sqlWhere);

            if (!string.IsNullOrEmpty(detalles.SqlOrderBy))
                sql.Append($" ORDER BY {detalles.SqlOrderBy}");

            return sql.ToString();
        }
    }
}