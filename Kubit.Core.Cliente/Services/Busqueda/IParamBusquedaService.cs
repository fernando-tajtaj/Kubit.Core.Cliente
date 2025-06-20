using Kubit.Core.Modelo;

namespace Kubit.Core.Cliente.Services.Busqueda
{
    public interface IParamBusquedaService
    {
        Task<ParamBusqueda?> GetParamBusquedaAsync(string pUuidPrograma, short pOrigen);
        Task<ParamBusquedaDetSql> GetParamBusquedaDetAsync(string pUuidParamBusqueda);
        Task<List<ParamBusquedaWhere>> GetParamBusquedaWhereAsync(string pUuidParamBusqueda, string pUuidPrograma);
        Task<List<Dictionary<string, object>>> ExecuteSelectAsync(string pSqlRequest);
    }
}
