using Kubit.Core.Cliente.Services.Consulta;
using Kubit.Core.Cliente.Services.Ejecucion;
using Kubit.Core.Modelo.Schemas.Consulta;
using System.Text.Json;

namespace Kubit.Core.Cliente.Handlers
{
    public class ConsultaHandler
    {
        private readonly IParamConsultaService paramConsultaService;
        private readonly IEjecucionService ejecucionService;
        private readonly SqlHandler sqlHandler;

        public ConsultaHandler(IParamConsultaService pParamConsultaService, IEjecucionService pEjecucionService, SqlHandler pSqlHandler)
        {
            this.paramConsultaService = pParamConsultaService;
            this.ejecucionService = pEjecucionService;
            this.sqlHandler = pSqlHandler;
        }

        public async Task<Fn_ParamConsulta_Vista_Json?> GetVistaJsonAsync(string pProgramaUuid)
        {
            try
            {
                // 1. Obtener la consulta base (ej: contiene un JSON con "consulta": "select ...")
                var paramConsultaGridJson = await this.paramConsultaService.GetParamConsultaVistaJsonAsync(pProgramaUuid, string.Empty);

                if (paramConsultaGridJson is null || string.IsNullOrEmpty(paramConsultaGridJson.ParamConsultaUuid))
                    return null;

                // 2. Construir cláusula WHERE dinámica
                var paramBusquedaWhere = await this.paramConsultaService.GetParamConsultaWhereAsync(
                    paramConsultaGridJson.ParamConsultaUuid,
                    pProgramaUuid
                );

                string sqlWhere = this.sqlHandler.BuildSqlWhere(paramBusquedaWhere);

                // 3. Obtener la consulta base del campo Datos (esperamos {"consulta": "select ..."})
                if (!paramConsultaGridJson.Datos.HasValue ||
                    !paramConsultaGridJson.Datos.Value.TryGetProperty("consulta", out JsonElement consultaElement))
                {
                    throw new InvalidOperationException("No se encontró el campo 'consulta' en Datos.");
                }

                string sqlQueryBase = consultaElement.GetString() ?? string.Empty;

                // se analiza la consulta base se busca si trae order by para cambiar su posición hasta el final de la consulta
                string orderBy = "";
                int orderByIndex = sqlQueryBase.IndexOf("order by", StringComparison.OrdinalIgnoreCase);

                if (orderByIndex > -1)
                {
                    orderBy = sqlQueryBase.Substring(orderByIndex);
                    sqlQueryBase = sqlQueryBase.Substring(0, orderByIndex).Trim();
                }

                // 4. Agregar WHERE si aplica
                if (!string.IsNullOrEmpty(sqlWhere))
                {
                    sqlQueryBase += $" where {sqlWhere}";
                }

                if (!string.IsNullOrEmpty(orderBy))
                {
                    sqlQueryBase += " " + orderBy;
                }

                // 5. Encapsular en: SELECT coalesce(json_agg(t), '[]') FROM (<consulta>) t
                string consultaFinal = $"select coalesce(json_agg(t), '[]') from ({sqlQueryBase}) t";

                // 6. Ejecutar consulta final y asignar resultado
                var resultado = await this.ejecucionService.EjecutarQueryAsync(consultaFinal);

                if (resultado.Success)
                {
                    paramConsultaGridJson.Datos = resultado.Data;
                }

                return paramConsultaGridJson;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error generando datos JSON del grid", ex);
            }
        }

        public async Task<Fn_ParamConsulta_Datos_Json> GetDatosJsonAsync(string pParamConsultaUuid, string pUuidPrograma)
        {
            try
            {
                var paramBusquedaWhere = await this.paramConsultaService.GetParamConsultaWhereAsync(pParamConsultaUuid, pUuidPrograma);

                string sqlWhere = this.sqlHandler.BuildSqlWhere(paramBusquedaWhere);

                var paramConsultaDatosJson = await this.paramConsultaService.GetParamConsultaDatosJsonAsync(pParamConsultaUuid, sqlWhere);

                return paramConsultaDatosJson ?? new Fn_ParamConsulta_Datos_Json();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error obteniendo consulta dinámica", ex);
            }
        }
    }
}
