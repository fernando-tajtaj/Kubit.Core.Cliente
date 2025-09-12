using Kubit.Core.Modelo.Response;
using System.Text.Json;

namespace Kubit.Core.Cliente.Services.Ejecucion
{
    public interface IEjecucionService
    {
        Task<BaseResponse<int>> EjecutarNonQueryAsync(string pSql);
        Task<BaseResponse<JsonElement>> EjecutarQueryAsync(string pSql);
    }
}
