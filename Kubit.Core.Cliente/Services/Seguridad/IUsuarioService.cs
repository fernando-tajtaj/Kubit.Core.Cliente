using Kubit.Core.Modelo;
using Kubit.Core.Modelo.DTO;

namespace Kubit.Core.Cliente.Services.Seguridad
{
    public interface IUsuarioService
    {
        Task<Fn_Usuario_Perfil?> LogInAsync(string pUsuarioCorreo, string pUsuarioContrasenia, string pUuidEmpresa);
        Task<UsuarioDTO> GetUsuarioByUuid(string pUsuarioUuid);
        Task<bool> ActualizarUsuarioAsync(UsuarioDTO pUsuarioPerfil);
    }
}
