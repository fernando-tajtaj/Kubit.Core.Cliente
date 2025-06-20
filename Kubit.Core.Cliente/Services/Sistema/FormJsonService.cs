using Kubit.Core.Modelo.DTO;
using Kubit.Core.Modelo.Templates;
using System.Net.Http;
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
        public async Task<TablaModelo?> GetTemplateAsync(string pProgramaTablaPrimaria)
        {
            try
            {
                var url = $"/api/formjson/template?pProgramaTablaPrimaria={Uri.EscapeDataString(pProgramaTablaPrimaria)}";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Error: {response.StatusCode}");
                    return null;
                }

                var templateJson = await response.Content.ReadAsStringAsync();

                var template = JsonSerializer.Deserialize<TablaModelo>(templateJson);

                return template;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Excepción: {ex.Message}");
                return null;
            }
        }
    }
}
