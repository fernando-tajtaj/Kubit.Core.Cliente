using Kubit.Core.Modelo.Schemas.Consulta;

namespace Kubit.Core.Cliente.Services.Consulta
{
    public interface IParamConsultaService
    {
        Task<Fn_ParamConsulta_Vista_Json?> GetParamConsultaVistaJsonAsync(string pProgramaUuid, string pSqlWhere);
        Task<Fn_ParamConsulta_Datos_Json?> GetParamConsultaDatosJsonAsync(string pParamConsultaUuid, string pSqlWhere);        
        Task<List<ParamConsultaWhere>> GetParamConsultaWhereAsync(string pParamConsultaUuid, string pUuidPrograma);
    }
}
