using Kubit.Core.Modelo.Response;
using Kubit.Core.Modelo.Schemas.Consulta;
using System.Text.Json;

namespace Kubit.Core.Cliente.Services.Consulta
{
    public class ParamConsultaService : IParamConsultaService
    {
        private readonly HttpClient _httpClient;

        public ParamConsultaService(HttpClient httpClient)
        {
            this._httpClient = httpClient;
        }
        public async Task<Fn_ParamConsulta_Vista_Json?> GetParamConsultaVistaJsonAsync(string pProgramaUuid, string pSqlWhere)
        {
            if (string.IsNullOrWhiteSpace(pProgramaUuid))
                return null;

            var url = $"/api/paramconsulta/vista?pProgramaUuid={Uri.EscapeDataString(pProgramaUuid)}&pSqlWhere={Uri.EscapeDataString(pSqlWhere)}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<BaseResponse<Fn_ParamConsulta_Vista_Json>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result?.Data;
        }

        public async Task<Fn_ParamConsulta_Datos_Json?> GetParamConsultaDatosJsonAsync(string pParamConsultaUuid, string pSqlWhere)
        {
            if (string.IsNullOrWhiteSpace(pParamConsultaUuid))
                return null;

            var url = $"/api/paramconsulta/busqueda?pParamConsultaUuid={Uri.EscapeDataString(pParamConsultaUuid)}&pSqlWhere={Uri.EscapeDataString(pSqlWhere)}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<BaseResponse<Fn_ParamConsulta_Datos_Json>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result?.Data;
        }

        public async Task<List<ParamConsultaWhere>> GetParamConsultaWhereAsync(string pParamConsultaUuid, string pUuidPrograma)
        {
            if (string.IsNullOrWhiteSpace(pParamConsultaUuid) || string.IsNullOrWhiteSpace(pUuidPrograma))
                return new List<ParamConsultaWhere>();

            try
            {
                var url = $"/api/paramconsulta/where?pParamConsultaUuid={Uri.EscapeDataString(pParamConsultaUuid)}&pUuidPrograma={Uri.EscapeDataString(pUuidPrograma)}";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Error al obtener WHERE: {response.StatusCode}");
                    return new List<ParamConsultaWhere>();
                }

                var contenido = await response.Content.ReadAsStringAsync();

                var resultado = JsonSerializer.Deserialize<List<ParamConsultaWhere>>(contenido, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return resultado ?? new List<ParamConsultaWhere>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Excepción: {ex.Message}");
                return new List<ParamConsultaWhere>();
            }
        }
    }
}
