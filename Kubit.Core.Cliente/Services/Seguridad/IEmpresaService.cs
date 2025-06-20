using Kubit.Core.Modelo;

namespace Kubit.Core.Cliente.Services.Seguridad
{
    public interface IEmpresaService
    {
        Task<List<Fn_Empresa_Correo>> GetEmpresasUsuarioAsync(string pUsuarioCorreo);
    }
}
