using Kubit.Core.Modelo;
using Kubit.Core.Modelo.Request;
using Kubit.Core.Modelo.Templates;
using System.Text.Json;
using System.Threading;

namespace Kubit.Core.Cliente.Services.Busqueda
{
    public class ParamBusquedaService : IParamBusquedaService
    {
        private readonly HttpClient _httpClient;

        public ParamBusquedaService(HttpClient httpClient)
        {
            this._httpClient = httpClient;
        }
        public async Task<ParamBusqueda?> GetParamBusquedaAsync(string pUuidPrograma, short pOrigen)
        {
            try
            {
                var url = $"/api/parambusqueda/busqueda?pUuidPrograma={Uri.EscapeDataString(pUuidPrograma)}&pOrigen={Uri.EscapeDataString(pOrigen.ToString())}";

                var response = await this._httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Error: {response.StatusCode}");
                    return null;
                }

                var respuesta = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                return JsonSerializer.Deserialize<ParamBusqueda>(respuesta, options);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Excepción: {ex.Message}");
                return null;
            }
        }

        public async Task<ParamBusquedaDetSql> GetParamBusquedaDetAsync(string pUuidParamBusqueda)
        {
            if (string.IsNullOrWhiteSpace(pUuidParamBusqueda))
                return new ParamBusquedaDetSql();

            try
            {
                var response = await _httpClient.GetAsync($"/api/parambusqueda/det?pUuidParamBusqueda={Uri.EscapeDataString(pUuidParamBusqueda)}");

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Error al obtener columnas: {response.StatusCode}");
                    return new ParamBusquedaDetSql();
                }

                var contenido = await response.Content.ReadAsStringAsync();

                // Deserializa el JSON en un objeto de tipo ParamBusquedaDetSql
                var resultado = JsonSerializer.Deserialize<ParamBusquedaDetSql>(contenido, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return resultado ?? new ParamBusquedaDetSql();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Excepción al consumir el servicio: {ex.Message}");
                return new ParamBusquedaDetSql();
            }
        }

        public async Task<List<ParamBusquedaWhere>> GetParamBusquedaWhereAsync(string pUuidParamBusqueda, string pUuidPrograma)
        {
            if (string.IsNullOrWhiteSpace(pUuidParamBusqueda) || string.IsNullOrWhiteSpace(pUuidPrograma))
                return new List<ParamBusquedaWhere>();

            try
            {
                var url = $"/api/parambusqueda/where?pUuidParamBusqueda={Uri.EscapeDataString(pUuidParamBusqueda)}&pUuidPrograma={Uri.EscapeDataString(pUuidPrograma)}";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Error al obtener WHERE: {response.StatusCode}");
                    return new List<ParamBusquedaWhere>();
                }

                var contenido = await response.Content.ReadAsStringAsync();

                var resultado = JsonSerializer.Deserialize<List<ParamBusquedaWhere>>(contenido, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return resultado ?? new List<ParamBusquedaWhere>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Excepción: {ex.Message}");
                return new List<ParamBusquedaWhere>();
            }
        }

        public async Task<List<Dictionary<string, object>>> ExecuteSelectAsync(string pSqlRequest)
        {
            string url = "/api/parambusqueda/select";
            var request = new SqlRequest { Sql = pSqlRequest };

            var response = await this._httpClient.PostAsJsonAsync(url, request);

            if (response.IsSuccessStatusCode)
            {
                var resultado = await response.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
                return resultado ?? new List<Dictionary<string, object>>();
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Error en API: {response.StatusCode} - {error}");
            }
        }
    }
}
