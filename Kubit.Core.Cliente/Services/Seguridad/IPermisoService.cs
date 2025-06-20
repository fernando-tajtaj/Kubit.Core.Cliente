using Kubit.Core.Modelo;

namespace Kubit.Core.Cliente.Services.Seguridad
{
    public interface IPermisoService
    {
        Task<List<Fn_Menu_Permisos>> GetMenuPermisosByUserAsync(string pUsuarioUuid);
    }
}
