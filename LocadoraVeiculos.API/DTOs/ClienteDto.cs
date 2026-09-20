using System;
using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.API.DTOs
{
    public class ClienteRequestDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CPF é obrigatório.")]
        [MaxLength(14)]
        public string CPF { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "E-mail inválido.")]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Telefone { get; set; } = string.Empty;

        [MaxLength(20)]
        public string CNH { get; set; } = string.Empty;

        public DateTime DataNascimento { get; set; }
    }

    public class ClienteResponseDto
    {
        public int      Id             { get; set; }
        public string   Nome           { get; set; } = string.Empty;
        public string   CPF            { get; set; } = string.Empty;
        public string   Email          { get; set; } = string.Empty;
        public string   Telefone       { get; set; } = string.Empty;
        public string   CNH            { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public DateTime DataCadastro   { get; set; }
    }
}

