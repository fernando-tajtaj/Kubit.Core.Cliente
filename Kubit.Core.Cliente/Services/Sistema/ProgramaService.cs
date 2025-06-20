using Kubit.Core.Modelo;
using Kubit.Core.Modelo.Templates;
using System.Text.Json;

namespace Kubit.Core.Cliente.Services.Sistema
{
    public class ProgramaService : IProgramaService
    {
        private readonly HttpClient _httpClient;

        public ProgramaService(HttpClient httpClient)
        {
            this._httpClient = httpClient;
        }
        public async Task<Programa?> GetProgramaUuidAsync(string pProgramaUuid, CancellationToken cancellationToken = default)
        {
            try
            {
                var url = $"/api/programa/programa?pProgramaUuid={Uri.EscapeDataString(pProgramaUuid)}";

                using var response = await _httpClient.GetAsync(url, cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    // Aquí podrías usar un logger en lugar de Console.WriteLine
                    Console.WriteLine($"Error: {response.StatusCode}");
                    return null;
                }

                var respuesta = await response.Content.ReadAsStringAsync(cancellationToken);

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var programa = JsonSerializer.Deserialize<Programa>(respuesta, options);

                return programa;
            }
            catch (OperationCanceledException)
            {
                // La petición fue cancelada
                return null;
            }
            catch (Exception ex)
            {
                // Aquí podrías usar un logger para registrar el error
                Console.WriteLine($"Excepción: {ex.Message}");
                return null;
            }
        }
    }
}
