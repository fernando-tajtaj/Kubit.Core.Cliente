using Kubit.Core.Modelo.Response;
using System.Text.Json;

namespace Kubit.Core.Cliente.Services.Sistema
{
    public class FormJsonService : IFormJsonService
    {
        private readonly HttpClient _httpClient;

        public FormJsonService(HttpClient httpClient)
        {
            this._httpClient = httpClient;
        }
        public async Task<Modelo.Templates.Modelo?> GetTemplateAsync(string pProgramaTablaPrimaria, string? pUuidEmpresa, string pAccion)
        {
            try
            {
                var url = $"/api/formjson/template?pProgramaTablaPrimaria={Uri.EscapeDataString(pProgramaTablaPrimaria)}";

                if (!string.IsNullOrWhiteSpace(pUuidEmpresa))
                    url += $"&pUuidEmpresa={Uri.EscapeDataString(pUuidEmpresa)}&pAccion={Uri.EscapeDataString(pAccion)}";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Error: {response.StatusCode}");
                    return null;
                }

                var responseJson = await response.Content.ReadAsStringAsync();

                // Define la estructura para deserializar la respuesta completa
                var wrapper = JsonSerializer.Deserialize<BaseResponse<Modelo.Templates.Modelo>>(
                    responseJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (wrapper == null || !wrapper.Success)
                {
                    Console.WriteLine("La respuesta no fue exitosa o está vacía.");
                    return null;
                }

                return wrapper.Data;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Excepción: {ex.Message}");
                return null;
            }
        }
    }
}
