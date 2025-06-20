using Kubit.Core.Modelo;
using Kubit.Core.Modelo.DTO;
using Kubit.Core.Modelo.Request;

namespace Kubit.Core.Cliente.Services.Seguridad
{
    public class UsuarioService : IUsuarioService
    {
        private readonly HttpClient _httpClient;

        public UsuarioService(HttpClient httpClient)
        {
            this._httpClient = httpClient;
        }

        public async Task<Fn_Usuario_Perfil?> LogInAsync(string pUsuarioCorreo, string pUsuarioContrasenia, string pUuidEmpresa)
        {
            var request = new UsuarioRequest
            {
                UsuarioCorreo = pUsuarioCorreo,
                UsuarioContrasenia = pUsuarioContrasenia,
                UuidEmpresa = pUuidEmpresa
            };

            var response = await this._httpClient.PostAsJsonAsync("/api/usuario/login", request);

            if (!response.IsSuccessStatusCode)
                return null;

            return await response.Content.ReadFromJsonAsync<Fn_Usuario_Perfil?>();
        }

        public async Task<UsuarioDTO> GetUsuarioByUuid(string pUsuarioUuid)
        {
            var response = await this._httpClient.GetAsync($"/api/usuario/perfil/{Uri.EscapeDataString(pUsuarioUuid)}");

            if (!response.IsSuccessStatusCode)
                return new UsuarioDTO(); // O lanzar excepción, según convenga

            var usuario = await response.Content.ReadFromJsonAsync<UsuarioDTO>();

            return usuario ?? new UsuarioDTO();
        }

        public async Task<bool> ActualizarUsuarioAsync(UsuarioDTO pUsuarioPerfil)
        {
            var response = await this._httpClient.PutAsJsonAsync("/api/usuario/actualizar", pUsuarioPerfil);

            return response.IsSuccessStatusCode;
        }
    }
}
