using Kubit.Core.Modelo.Schemas.Seguridad;

namespace Kubit.Core.Cliente.Services.Seguridad
{
    public interface IPermisoService
    {
        Task<List<Fn_Menu_Permisos>> GetMenuPermisosByUserAsync(string pUsuarioUuid);
    }
}
