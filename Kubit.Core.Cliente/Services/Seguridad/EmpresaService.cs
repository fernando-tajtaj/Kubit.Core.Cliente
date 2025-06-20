using Kubit.Core.Modelo;

namespace Kubit.Core.Cliente.Services.Seguridad
{
    public class EmpresaService : IEmpresaService
    {
        private readonly HttpClient _httpClient;

        public EmpresaService(HttpClient httpClient)
        {
            this._httpClient = httpClient;
        }

        public async Task<List<Fn_Empresa_Correo>> GetEmpresasUsuarioAsync(string pUsuarioCorreo)
        {
            var response = await this._httpClient.GetAsync($"/api/empresa/correo?pUsuarioCorreo={Uri.EscapeDataString(pUsuarioCorreo)}");

            if (!response.IsSuccessStatusCode)
                return new List<Fn_Empresa_Correo>();

            var resultado = await response.Content.ReadFromJsonAsync<List<Fn_Empresa_Correo>>();
            return resultado ?? new List<Fn_Empresa_Correo>();
        }
    }
}
