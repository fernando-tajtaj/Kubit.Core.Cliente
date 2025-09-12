using Kubit.Core.Modelo.Request;
using Kubit.Core.Modelo.Response;
using System.Net.Http;
using System.Text.Json;

namespace Kubit.Core.Cliente.Services.Ejecucion
{
    public class EjecucionService : IEjecucionService
    {
        private readonly HttpClient _httpClient;

        public EjecucionService(HttpClient httpClient)
        {
            this._httpClient = httpClient;
        }

        public async Task<BaseResponse<int>> EjecutarNonQueryAsync(string sql)
        {
            var request = new SqlRequest { Sql = sql };

            var response = await _httpClient.PostAsJsonAsync("/api/ejecucion/nonquery", request);

            if (!response.IsSuccessStatusCode)
            {
                return new BaseResponse<int>
                {
                    Success = false,
                    Message = "Error al ejecutar la consulta SQL.",
                    Data = 0
                };
            }

            var result = await response.Content.ReadFromJsonAsync<BaseResponse<int>>(new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? new BaseResponse<int>
            {
                Success = false,
                Message = "Error al deserializar la respuesta.",
                Data = 0
            };
        }

        public async Task<BaseResponse<JsonElement>> EjecutarQueryAsync(string sql)
        {
            var request = new SqlRequest { Sql = sql };

            var response = await _httpClient.PostAsJsonAsync("/api/ejecucion/query", request);

            if (!response.IsSuccessStatusCode)
            {
                return new BaseResponse<JsonElement>
                {
                    Success = false,
                    Message = "Error al ejecutar la consulta SQL.",
                    Data = default
                };
            }

            var result = await response.Content.ReadFromJsonAsync<BaseResponse<JsonElement>>(new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? new BaseResponse<JsonElement>
            {
                Success = false,
                Message = "Error al deserializar la respuesta.",
                Data = default
            };
        }
    }
}
